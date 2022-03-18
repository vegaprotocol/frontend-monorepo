import {
  DefaultApi,
  createConfiguration,
  Configuration,
  OrderSubmissionBody,
} from '@vegaprotocol/vegawallet-service-api-client';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { WALLET_CONFIG } from '../storage-keys';
import { VegaConnector } from '.';

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

  async authenticate(params: { wallet: string; passphrase: string }) {
    try {
      const res = await this.service.authTokenPost(params);

      // Renew service instance with default bearer authMethod now that we have the token
      this.service = new DefaultApi(
        createConfiguration({
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

  async sendTx(body: OrderSubmissionBody) {
    try {
      const res = await this.service.commandSyncPost(body);
      return res;
    } catch (err) {
      return this.handleSendTxError(err);
    }
  }

  private handleSendTxError(err: unknown) {
    if (typeof err === 'object' && err && 'body' in err) {
      try {
        // @ts-ignore Not sure why TS can't infer that 'body' does indeed exist on object
        const parsedError = JSON.parse(err.body);
        return parsedError;
      } catch {
        // Unexpected response
        return {
          error: 'Something went wrong',
        };
      }
    } else {
      return {
        error: 'Something went wrong',
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
        const obj = JSON.parse(cfg);
        return obj;
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
