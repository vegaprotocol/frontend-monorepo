import { LocalStorage } from '@vegaprotocol/react-helpers';
import { WALLET_CONFIG } from '../storage-keys';
import type { VegaConnector } from './vega-connector';
import type { TransactionSubmission } from '../wallet-types';

// Perhaps there should be a default ConnectorConfig that others can extend off. Do all connectors
// need to use local storage, I don't think so...
interface RestConnectorConfig {
  token: string | null;
  connector: 'rest';
  url: string | null;
}

type Endpoint = 'auth/token' | 'command/sync' | 'keys';

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

      // Store the token, and other things for later
      this.setConfig({
        connector: 'rest',
        token: res.data.token,
        url: this.url,
      });
      this.token = res.data.token;

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

      return res.data.keys;
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

      return res.data;
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
