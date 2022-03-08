import {
  DefaultApi,
  createConfiguration,
  Configuration,
  VegaKey,
} from '@vegaprotocol/vegawallet-service-api-client';
import { LocalStorage } from '@vegaprotocol/storage';

export interface VegaConnector {
  /** Description of how to use this connector */
  description: string;

  /** Connect to wallet and return keys */
  connect(): Promise<VegaKey[] | null>;

  /** Disconnect from wallet */
  disconnect(): Promise<void>;
}

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
  static storageKey = 'vega_wallet';
  apiConfig: Configuration;
  service: DefaultApi;
  description = 'Connects using REST to the Vega wallet desktop app';

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

  private setConfig(cfg: RestConnectorConfig) {
    LocalStorage.setItem(RestConnector.storageKey, JSON.stringify(cfg));
  }

  private getConfig(): RestConnectorConfig | null {
    const cfg = LocalStorage.getItem(RestConnector.storageKey);
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
    LocalStorage.removeItem(RestConnector.storageKey);
  }
}

/**
 * Dummy injected connector that we may use when browser wallet is implemented
 */
export class InjectedConnector implements VegaConnector {
  description = 'Connects using the Vega wallet browser extension';

  async connect() {
    return [
      {
        index: 9,
        pub: '0x123',
        algorithm: { name: 'algo', version: 2 },
        tainted: false,
        meta: [],
      },
    ];
  }

  async disconnect() {
    return;
  }
}
