import { ethers } from 'ethers';
import { z } from 'zod';
import { clearConfig, getConfig, setConfig } from '../storage';
import type { TransactionSubmission } from '../wallet-types';
import type { VegaConnector } from './vega-connector';

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
  }),
});

const ErrorSchema = BaseSchema.extend({
  error: z.object({
    message: z.string(),
    data: z.string(),
    code: z.number(),
  }),
});

type Response =
  | z.infer<typeof ConnectWalletSchema>
  | z.infer<typeof ListKeysSchema>
  | z.infer<typeof GetChainIdSchema>
  | z.infer<typeof GetPermissionsSchema>
  | z.infer<typeof RequestPermissionsSchema>
  | z.infer<typeof SendTransactionSchema>
  | z.infer<typeof ErrorSchema>;

const Errors = {
  NO_TOKEN: new Error('No token'),
};

export class JsonRpcConnector implements VegaConnector {
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
    const data = GetChainIdSchema.parse(result);
    return data.result;
  }

  async connectWallet() {
    const result = await this.request(Methods.ConnectWallet, {
      hostname: window.location.host,
    });
    this.verifyResponse(result);
    const data = ConnectWalletSchema.parse(result);
    // store token and other config for eager connect and subsequent requests
    setConfig({
      token: data.result.token,
      connector: 'jsonRpc',
      url: this.url,
    });
    return data.result;
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
    const data = GetPermissionsSchema.parse(result);
    return data.result;
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
    const data = RequestPermissionsSchema.parse(result);
    return data.result;
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
    const data = ListKeysSchema.parse(result);
    return data.result.keys;
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

  // TODO: Ensure this is working with returned signature
  // @ts-ignore v2 wallet api return types differ from v1
  async sendTx(
    payload: TransactionSubmission
  ): Promise<z.infer<typeof SendTransactionSchema>> {
    const cfg = getConfig();
    if (!cfg?.token) {
      throw Errors.NO_TOKEN;
    }

    const tx = {
      ...payload,
    };

    // Prune fields to create valid encoded transaction
    /*
    delete tx['pubKey'];
    delete tx['propagate'];
    */

    const encodedTransaction = ethers.utils.base64.encode(
      ethers.utils.toUtf8Bytes(JSON.stringify(tx))
    );

    const res = await this.request(Methods.SendTransaction, {
      token: cfg.token,
      publicKey: payload.pubKey,
      sendingMode: 'TYPE_SYNC',
      encodedTransaction,
    });

    return res;
  }

  private request(method: Methods, params?: object) {
    return fetch(`${this.url}/api/${VERSION}/requests`, {
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
    }).then((res) => res.json());
  }

  private verifyResponse(result: Response) {
    if ('error' in result) {
      throw new Error(
        `${result.error.message} (${result.error.code}): ${result.error.data}`
      );
    }
  }
}
