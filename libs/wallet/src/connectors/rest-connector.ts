import * as Sentry from '@sentry/react';
import { clearConfig, getConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';
import { WalletError } from './vega-connector';
import { z } from 'zod';
import { t } from '@vegaprotocol/i18n';

type TransactionError =
  | {
      errors: {
        [key: string]: string[];
      };
      details?: string[];
    }
  | {
      error: string;
      details?: string[];
    };

const VERSION = 'v1';

// Perhaps there should be a default ConnectorConfig that others can extend off. Do all connectors
// need to use local storage, I don't think so...

enum Endpoints {
  Auth = 'auth/token',
  Command = 'command/sync',
  Keys = 'keys',
}

export const AuthTokenSchema = z.object({
  token: z.string(),
});

export const TransactionResponseSchema = z.object({
  txHash: z.string(),
  tx: z.object({
    signature: z.object({
      value: z.string(),
    }),
  }),
  sentAt: z.string(),
  receivedAt: z.string(),
});
export type V1TransactionResponse = z.infer<typeof TransactionResponseSchema>;

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
  url: string | null = null;
  token: string | null = null;

  constructor() {
    const cfg = getConfig();
    if (cfg) {
      this.token = cfg.token;
      this.url = cfg.url;
    }
  }

  async sessionActive() {
    return Boolean(this.token);
  }

  async authenticate(params: { wallet: string; passphrase: string }) {
    try {
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
      setConfig({
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

      return data.keys.map((k) => {
        const nameMeta = k.meta.find((m) => m.key === 'name');
        return {
          publicKey: k.pub,
          name: nameMeta ? nameMeta.value : t('No name'),
        };
      });
    } catch (err) {
      // keysGet failed, its likely that the session has expired so remove the token from storage
      clearConfig();
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
      clearConfig();
    }
  }

  async sendTx(pubKey: string, transaction: Transaction) {
    const body = {
      pubKey,
      propagate: true,
      ...transaction,
    };
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
      throw new WalletError(res.error, 1, res.details);
    }

    const data = TransactionResponseSchema.parse(res.data);

    // Make return value match that of v2 service
    return {
      transactionHash: data.txHash,
      signature: data.tx.signature.value,
      receivedAt: data.receivedAt,
      sentAt: data.sentAt,
    };
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
      const fetchResult = await fetch(
        `${this.url}/api/${VERSION}/${endpoint}`,
        {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          },
        }
      );

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
        error: 'No wallet detected',
      };
    }
  }
}
