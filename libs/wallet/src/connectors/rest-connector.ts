import type { Configuration } from '@vegaprotocol/vegawallet-service-api-client';
import {
  createConfiguration,
  ServerConfiguration,
  DefaultApi,
} from '@vegaprotocol/vegawallet-service-api-client';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { WALLET_CONFIG } from '../storage-keys';
import type { VegaConnector } from './vega-connector';
import type { TransactionSubmission } from '../types';

// Perhaps there should be a default ConnectorConfig that others can extend off. Do all connectors
// need to use local storage, I don't think so...
interface RestConnectorConfig {
  token: string | null;
  connector: 'rest';
}

/**
 * Connector for using the Vega Wallet Service rest api, requires authentication to get a session token
 */
export class RestConnector implements VegaConnector {
  configKey = WALLET_CONFIG;
  apiConfig: Configuration;
  service: DefaultApi;
  description = 'Connects using REST to a running Vega wallet service';

  constructor() {
    const cfg = this.getConfig();

    // If theres a stored auth token create api config with bearer authMethod
    this.apiConfig = cfg?.token
      ? createConfiguration({
          authMethods: {
            bearer: `Bearer ${cfg.token}`,
          },
        })
      : createConfiguration();

    this.service = new DefaultApi(this.apiConfig);
  }

  async authenticate(
    url: string,
    params: {
      wallet: string;
      passphrase: string;
    }
  ) {
    try {
      const service = new DefaultApi(
        createConfiguration({
          baseServer: new ServerConfiguration<Record<string, never>>(url, {}),
        })
      );

      const res = await service.authTokenPost(params);

      // Renew service instance with default bearer authMethod now that we have the token
      this.service = new DefaultApi(
        createConfiguration({
          baseServer: new ServerConfiguration<Record<string, never>>(url, {}),
          authMethods: {
            bearer: `Bearer ${res.token}`,
          },
        })
      );

      // Store the token, and other things for later
      this.setConfig({ connector: 'rest', token: res.token });

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  async connect() {
    try {
      const res = await this.service.keysGet();
      return res.keys;
    } catch (err) {
      console.error(err);
      // keysGet failed, its likely that the session has expired so remove the token from storage
      this.clearConfig();
      return null;
    }
  }

  async disconnect() {
    try {
      await this.service.authTokenDelete();
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
      const res = await this.service.commandSyncPost(body);
      return res;
    } catch (err) {
      return this.handleSendTxError(err);
    }
  }

  private handleSendTxError(err: unknown) {
    const unexpectedError = { error: 'Something went wrong' };

    if (isServiceError(err)) {
      if (err.code === 401) {
        return { error: 'User rejected' };
      }

      try {
        return JSON.parse(err.body ?? '');
      } catch {
        return unexpectedError;
      }
    } else {
      return unexpectedError;
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
}

interface ServiceError {
  code: number;
  body: string | undefined;
  headers: object;
}

export const isServiceError = (err: unknown): err is ServiceError => {
  // Some responses don't contain body object
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return true;
  }
  return false;
};
