import { LocalStorage } from '@vegaprotocol/react-helpers';
import { WALLET_CONFIG } from '../storage-keys';
import type { VegaConnector } from './vega-connector';
import type { TransactionSubmission } from '../wallet-types';
import { z } from 'zod';

// Perhaps there should be a default ConnectorConfig that others can extend off. Do all connectors
// need to use local storage, I don't think so...
interface RestConnectorConfig {
  token: string | null;
  connector: 'rest';
  url: string | null;
}

type Endpoint = 'auth/token' | 'command/sync' | 'keys';

export const AuthTokenSchema = z.object({
  token: z.string(),
});

export const TransactionResponseSchema = z.object({
  txId: z.string(),
  txHash: z.string(),
  tx: z.object({
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
  sentAt: z.string(),
  receivedAt: z.string(),
});

export const GetKeysSchema = z.object({
  keys: z.array(
    z.object({
      algorithm: z.object({
        name: z.string(),
        version: z.number(),
      }),
      index: z.number(),
      meta: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
      pub: z.string(),
      tainted: z.boolean(),
    })
  ),
});

/**
 * Connector for using the Vega Wallet Service rest api, requires authentication to get a session token
 */
export class RestConnector implements VegaConnector {
  configKey = WALLET_CONFIG;
  description = 'Connects using REST to a running Vega wallet service';
  url: string | null = null;
  token: string | null = null;

  constructor() {
    const cfg = this.getConfig();
    if (cfg) {
      this.token = cfg.token;
      this.url = cfg.url;
    }
  }

  async authenticate(
    url: string,
    params: {
      wallet: string;
      passphrase: string;
    }
  ) {
    try {
      this.url = url;

      const res = await this.request('auth/token', {
        method: 'post',
        body: JSON.stringify(params),
      });

      const data = AuthTokenSchema.parse(res.data);

      // Store the token, and other things for later
      this.setConfig({
        connector: 'rest',
        token: data.token,
        url: this.url,
      });
      this.token = data.token;

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  async connect() {
    try {
      const res = await this.request('keys', {
        method: 'get',
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      const data = GetKeysSchema.parse(res.data);

      return data.keys;
    } catch (err) {
      // keysGet failed, its likely that the session has expired so remove the token from storage
      this.clearConfig();
      return null;
    }
  }

  async disconnect() {
    try {
      await this.request('auth/token', {
        method: 'delete',
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      // Always clear config, if authTokenDelete fails the user still tried to
      // connect so clear the config (and containing token) from storage
      this.clearConfig();
    }
  }

  async sendTx(body: TransactionSubmission) {
    try {
      const res = await this.request('command/sync', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      if (res.status === 401) {
        // User rejected
        return null;
      }

      const data = TransactionResponseSchema.parse(res.data);

      return data;
    } catch (err) {
      return {
        error: 'Failed to fetch',
      };
    }
  }

  private setConfig(cfg: RestConnectorConfig) {
    LocalStorage.setItem(this.configKey, JSON.stringify(cfg));
  }

  private getConfig(): RestConnectorConfig | null {
    const cfg = LocalStorage.getItem(this.configKey);
    if (cfg) {
      try {
        return JSON.parse(cfg);
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  private clearConfig() {
    LocalStorage.removeItem(this.configKey);
  }

  private async request(endpoint: Endpoint, options: RequestInit) {
    const fetchResult = await fetch(`${this.url}/${endpoint}`, options);
    const jsonResult = await fetchResult.json();
    return {
      status: fetchResult.status,
      data: jsonResult,
    };
  }
}
