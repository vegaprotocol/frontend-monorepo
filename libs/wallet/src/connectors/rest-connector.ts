import * as Sentry from '@sentry/react';
import { LocalStorage, t } from '@vegaprotocol/react-helpers';
import { WALLET_CONFIG } from '../storage-keys';
import type { VegaConnector } from './vega-connector';
import type { TransactionError, TransactionSubmission } from '../wallet-types';
import { z } from 'zod';

// Perhaps there should be a default ConnectorConfig that others can extend off. Do all connectors
// need to use local storage, I don't think so...
interface RestConnectorConfig {
  token: string | null;
  connector: 'rest';
  url: string | null;
}

enum Endpoints {
  Auth = 'auth/token',
  Command = 'command/sync',
  Keys = 'keys',
}

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

      const res = await this.request(Endpoints.Auth, {
        method: 'post',
        body: JSON.stringify(params),
      });

      if (res.status === 403) {
        return { success: false, error: t('Invalid credentials') };
      }

      if (res.error) {
        return { success: false, error: res.error };
      }

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
      return { success: false, error: 'Authentication failed' };
    }
  }

  async connect() {
    try {
      const res = await this.request(Endpoints.Keys, {
        method: 'get',
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      if (res.error) {
        return null;
      }

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
      await this.request(Endpoints.Auth, {
        method: 'delete',
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });
    } catch (err) {
      Sentry.captureException(err);
    } finally {
      // Always clear config, if authTokenDelete fails the user still tried to
      // connect so clear the config (and containing token) from storage
      this.clearConfig();
    }
  }

  async sendTx(body: TransactionSubmission) {
    try {
      const res = await this.request(Endpoints.Command, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });

      // User rejected
      if (res.status === 401) {
        return null;
      }

      if (res.error) {
        if (res.details) {
          return {
            error: res.error,
            details: res.details,
          };
        }
        return {
          error: res.error,
        };
      }

      const data = TransactionResponseSchema.parse(res.data);

      return data;
    } catch (err) {
      Sentry.captureException(err);
      return null;
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

  /** Parse more complex error object into a single string */
  private parseError(err: TransactionError): string {
    if ('error' in err) {
      return err.error;
    }

    if ('errors' in err) {
      const result = Object.entries(err.errors)
        .map((entry) => {
          return `${entry[0]}: ${entry[1].join(' | ')}`;
        })
        .join(', ');
      return result;
    }

    return t('Something went wrong');
  }

  /** Parse error details array into a single string */
  private parseErrorDetails(err: TransactionError): string | null {
    if (err.details && err.details.length > 0) {
      return err.details.join(', ');
    }

    return null;
  }

  private async request(
    endpoint: Endpoints,
    options: RequestInit
  ): Promise<{
    status?: number;
    data?: unknown;
    error?: string;
    details?: string;
  }> {
    try {
      const fetchResult = await fetch(`${this.url}/${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        },
      });

      if (!fetchResult.ok) {
        const errorData = await fetchResult.json();
        const error = this.parseError(errorData);
        const errorDetails = this.parseErrorDetails(errorData);

        if (errorDetails) {
          return {
            status: fetchResult.status,
            error,
            details: errorDetails,
          };
        }

        return {
          status: fetchResult.status,
          error,
        };
      }

      // auth/token delete doesnt return json
      if (endpoint === 'auth/token' && options.method === 'delete') {
        const textResult = await fetchResult.text();
        return {
          status: fetchResult.status,
          data: textResult,
        };
      } else {
        const jsonResult = await fetchResult.json();
        return {
          status: fetchResult.status,
          data: jsonResult,
        };
      }
    } catch (err) {
      return {
        error: 'Failed to fetch',
      };
    }
  }
}
