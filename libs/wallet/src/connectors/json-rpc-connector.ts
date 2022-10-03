import { t } from '@vegaprotocol/react-helpers';
import { z } from 'zod';
import { clearConfig, getConfig, setConfig } from '../storage';
import { encodeTransaction } from '../utils';
import type { Transaction, VegaConnector } from './vega-connector';
import { WalletError } from './vega-connector';

const VERSION = 'v2';

enum Methods {
  ConnectWallet = 'client.connect_wallet',
  DisconnectWallet = 'client.disconnect_wallet',
  GetPermissions = 'client.get_permissions',
  RequestPermisssions = 'client.request_permissions',
  ListKeys = 'client.list_keys',
  SendTransaction = 'client.send_transaction',
  GetChainId = 'client.get_chain_id',
}

const BaseSchema = z.object({
  id: z.string(),
  jsonrpc: z.literal('2.0'),
});

const ConnectWalletSchema = BaseSchema.extend({
  result: z.object({
    token: z.string(),
  }),
});

const ListKeysSchema = BaseSchema.extend({
  result: z.object({
    keys: z.array(
      z.object({
        publicKey: z.string(),
        name: z.string(),
      })
    ),
  }),
});

const GetChainIdSchema = BaseSchema.extend({
  result: z.object({
    chainID: z.string(),
  }),
});

const GetPermissionsSchema = BaseSchema.extend({
  result: z.object({
    permissions: z.object({
      public_keys: z.enum(['none', 'read', 'write']),
    }),
  }),
});

const RequestPermissionsSchema = BaseSchema.extend({
  result: z.object({
    permissions: z.object({
      public_keys: z.enum(['none', 'read', 'write']),
    }),
  }),
});

const SendTransactionSchema = BaseSchema.extend({
  result: z.object({
    receivedAt: z.string(),
    sentAt: z.string(),
    transactionHash: z.string(),
    transaction: z.object({
      signature: z.object({
        value: z.string(),
      }),
    }),
  }),
});

type JsonRpcError = {
  message: string;
  code: number;
  data?: string;
};

type Response =
  | z.infer<typeof ConnectWalletSchema>
  | z.infer<typeof ListKeysSchema>
  | z.infer<typeof GetChainIdSchema>
  | z.infer<typeof GetPermissionsSchema>
  | z.infer<typeof RequestPermissionsSchema>
  | z.infer<typeof SendTransactionSchema>
  | { error: JsonRpcError };

export const ClientErrors = {
  NO_SERVICE: new WalletError(t('No service'), 100),
  NO_TOKEN: new WalletError(t('No token'), 101),
  INVALID_RESPONSE: new WalletError(t('Something went wrong'), 102),
  INVALID_WALLET: new WalletError(t('Wallet version invalid'), 103),
  WRONG_NETWORK: new WalletError(
    t('Wrong network'),
    104,
    t('App is configured to work with a different chain')
  ),
  UNKNOWN: new WalletError(
    t('Something went wrong'),
    105,
    t('Unknown error occurred')
  ),
} as const;

export class JsonRpcConnector implements VegaConnector {
  version = VERSION;
  url: string | null = null;
  token: string | null = null;
  reqId = 0;

  constructor() {
    const cfg = getConfig();
    if (cfg) {
      this.token = cfg.token;
      this.url = cfg.url;
    }
  }

  async getChainId() {
    const result = await this.request(Methods.GetChainId);
    if ('error' in result) {
      throw this.wrapError(result.error);
    }
    const parseResult = GetChainIdSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result;
    } else {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async connectWallet() {
    const result = await this.request(Methods.ConnectWallet, {
      hostname: window.location.host,
    });
    if ('error' in result) {
      throw this.wrapError(result.error);
    }
    const parseResult = ConnectWalletSchema.safeParse(result);

    if (parseResult.success) {
      // store token and other config for eager connect and subsequent requests
      setConfig({
        token: parseResult.data.result.token,
        connector: 'jsonRpc',
        url: this.url,
      });
      return parseResult.data.result;
    } else {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async getPermissions() {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw ClientErrors.NO_TOKEN;
    }
    const result = await this.request(Methods.GetPermissions, {
      token: cfg.token,
    });
    if ('error' in result) {
      throw this.wrapError(result.error);
    }
    const parseResult = GetPermissionsSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result;
    } else {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async requestPermissions() {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw ClientErrors.NO_TOKEN;
    }
    const result = await this.request(Methods.RequestPermisssions, {
      token: cfg.token,
      requestedPermissions: {
        public_keys: 'read',
      },
    });
    if ('error' in result) {
      throw this.wrapError(result.error);
    }
    const parseResult = RequestPermissionsSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result;
    } else {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  // connect actually calling list_keys here, not to be confused with connect_wallet
  // which retrieves the session token
  async connect() {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw ClientErrors.NO_TOKEN;
    }
    const result = await this.request(Methods.ListKeys, {
      token: cfg.token,
    });
    if ('error' in result) {
      throw this.wrapError(result.error);
    }
    const parseResult = ListKeysSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result.keys;
    } else {
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async disconnect() {
    const cfg = getConfig();

    if (cfg?.token) {
      await this.request(Methods.DisconnectWallet, {
        token: cfg.token,
      });
    }

    clearConfig();
  }

  async sendTx(pubKey: string, transaction: Transaction) {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw ClientErrors.NO_TOKEN;
    }

    const result = await this.request(Methods.SendTransaction, {
      token: cfg.token,
      publicKey: pubKey,
      sendingMode: 'TYPE_SYNC',
      encodedTransaction: encodeTransaction(transaction),
    });

    const parsedResult = SendTransactionSchema.safeParse(result);

    if (parsedResult.success) {
      return {
        transactionHash: parsedResult.data.result.transactionHash,
        sentAt: parsedResult.data.result.sentAt,
        receivedAt: parsedResult.data.result.receivedAt,
        signature: parsedResult.data.result.transaction.signature.value,
      };
    } else {
      // In the case of sending a tx, return null instead of throwing
      // this indicates to the app that the user rejected the tx rather
      // than it being a true erroor
      if ('error' in result && result.error.code === 3001) {
        return null;
      }
      throw ClientErrors.INVALID_RESPONSE;
    }
  }

  async checkCompat() {
    try {
      const result = await fetch(`${this.url}/api/${this.version}/methods`);
      if (!result.ok) {
        const err = ClientErrors.INVALID_WALLET;
        err.data = t(
          `The wallet running at ${this.url} is not supported. Required version is ${this.version}`
        );
        throw err;
      }
      return true;
    } catch (err) {
      if (err instanceof WalletError) {
        throw err;
      }

      throw ClientErrors.NO_SERVICE;
    }
  }

  private async request(method: Methods, params?: object): Promise<Response> {
    try {
      const result = await fetch(`${this.url}/api/${this.version}/requests`, {
        method: 'post',
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: `${this.reqId++}`,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await result.json();
      return json;
    } catch (err) {
      throw ClientErrors.NO_SERVICE;
    }
  }

  private wrapError(error: JsonRpcError) {
    return new WalletError(error.message, error.code, error.data);
  }
}
