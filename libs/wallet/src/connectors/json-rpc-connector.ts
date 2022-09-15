import { z } from 'zod';
import { clearConfig, getConfig, setConfig } from '../storage';
import { encodeTransaction } from '../utils';
import type { Transaction, VegaConnector } from './vega-connector';
import { WalletError } from './vega-connector';

const VERSION = 'v2';

enum Methods {
  ConnectWallet = 'session.connect_wallet',
  DisconnectWallet = 'session.disconnect_wallet',
  GetPermissions = 'session.get_permissions',
  RequestPermisssions = 'session.request_permissions',
  ListKeys = 'session.list_keys',
  SendTransaction = 'session.send_transaction',
  GetChainId = 'session.get_chain_id',
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
    keys: z.array(z.string()),
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
      version: z.number(),
      From: z.object({
        PubKey: z.string(),
      }),
      input_data: z.string(),
      pow: z.object({
        tid: z.string(),
        nonce: z.number(),
      }),
      signature: z.object({
        algo: z.string(),
        value: z.string(),
        version: z.number(),
      }),
    }),
  }),
});

type Response =
  | z.infer<typeof ConnectWalletSchema>
  | z.infer<typeof ListKeysSchema>
  | z.infer<typeof GetChainIdSchema>
  | z.infer<typeof GetPermissionsSchema>
  | z.infer<typeof RequestPermissionsSchema>
  | z.infer<typeof SendTransactionSchema>
  | {
      error: WalletError;
    };

export const Errors = {
  NO_TOKEN: new WalletError('No token', 1),
  INVALID_RESPONSE: new WalletError('Invalid response from wallet', 2),
  NO_SERVICE: new WalletError('No service', 3),
  INVALID_WALLET: new WalletError('Wallet version invalid', 4),
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
    this.verifyResponse(result);
    const parseResult = GetChainIdSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result;
    } else {
      throw Errors.INVALID_RESPONSE;
    }
  }

  async connectWallet() {
    const result = await this.request(Methods.ConnectWallet, {
      hostname: window.location.host,
    });
    this.verifyResponse(result);
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
      throw Errors.INVALID_RESPONSE;
    }
  }

  async getPermissions() {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw Errors.NO_TOKEN;
    }
    const result = await this.request(Methods.GetPermissions, {
      token: cfg.token,
    });
    this.verifyResponse(result);
    const parseResult = GetPermissionsSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result;
    } else {
      throw Errors.INVALID_RESPONSE;
    }
  }

  async requestPermissions() {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw Errors.NO_TOKEN;
    }
    const result = await this.request(Methods.RequestPermisssions, {
      token: cfg.token,
      requestedPermissions: {
        public_keys: 'read',
      },
    });
    this.verifyResponse(result);
    const parseResult = RequestPermissionsSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result;
    } else {
      throw Errors.INVALID_RESPONSE;
    }
  }

  // connect actually calling list_keys here, not to be confused with connect_wallet
  // which retrieves the session token
  async connect() {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw Errors.NO_TOKEN;
    }
    const result = await this.request(Methods.ListKeys, {
      token: cfg.token,
    });
    this.verifyResponse(result);
    const parseResult = ListKeysSchema.safeParse(result);
    if (parseResult.success) {
      return parseResult.data.result.keys;
    } else {
      throw Errors.INVALID_RESPONSE;
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
      throw Errors.NO_TOKEN;
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
      // prevent an error when the user rejects the transaction
      if ('error' in result && result.error.code === 3001) {
        return null;
      }
      throw Errors.INVALID_RESPONSE;
    }
  }

  async checkCompat() {
    try {
      const result = await fetch(`${this.url}/api/${this.version}/methods`);
      if (!result.ok) {
        const err = Errors.INVALID_WALLET;
        err.data = `The wallet running at ${this.url} is not supported. Required version is ${this.version}`;
        throw err;
      }
      return true;
    } catch (err) {
      if (err instanceof WalletError) {
        throw err;
      }

      throw Errors.NO_SERVICE;
    }
  }

  private async request(method: Methods, params?: object) {
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
      throw Errors.NO_SERVICE;
    }
  }

  private verifyResponse(result: Response) {
    if ('error' in result) {
      throw new WalletError(
        result.error.message,
        result.error.code,
        result.error.data
      );
    }
  }
}
