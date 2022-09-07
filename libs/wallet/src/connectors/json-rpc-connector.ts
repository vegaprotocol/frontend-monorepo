import { ethers } from 'ethers';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { WALLET_CONFIG } from '../storage-keys';
import type { TransactionSubmission } from '../wallet-types';
import type { ConnectorConfig, VegaConnector } from './vega-connector';

const VERSION = 'v2';

export class JsonRpcConnector implements VegaConnector {
  configKey = WALLET_CONFIG;
  url: string | null = null;
  token: string | null = null;
  id = 0;

  constructor() {
    const cfg = this.getConfig();
    if (cfg) {
      this.token = cfg.token;
      this.url = cfg.url;
    }
  }

  async connectWallet(url: string) {
    this.url = url;

    const result = await this.request('session.connect_wallet', {
      hostname: window.location.host,
    });

    if ('error' in result) {
      return result;
    } else {
      this.setConfig({
        token: result.result.token,
        connector: 'jsonRpc',
        url: this.url,
      });
      return result;
    }
  }

  async getPermissions() {
    const cfg = this.getConfig();
    if (!cfg) return null;

    const perms = await this.request('session.get_permissions', {
      token: cfg.token,
    });

    return perms;
  }

  async requestPermissions() {
    const cfg = this.getConfig();
    if (!cfg) return null;
    const reqPerms = await this.request('session.request_permissions', {
      token: cfg.token,
      requestedPermissions: {
        public_keys: 'read',
      },
    });

    return reqPerms;
  }

  async connect() {
    const cfg = this.getConfig();
    if (!cfg) return null;
    try {
      const keys = await this.request('session.list_keys', {
        token: cfg.token,
      });

      return keys.result.keys;
    } catch (err) {
      console.error(err);
    }
  }

  async disconnect() {
    const cfg = this.getConfig();
    if (!cfg) return null;
    const result = await this.request('session.disconnect_wallet', {
      token: cfg.token,
    });
    LocalStorage.removeItem(this.configKey);
    return result;
  }

  // @ts-ignore v2 wallet api return types differ from v1
  async sendTx(payload: TransactionSubmission) {
    const cfg = this.getConfig();
    if (!cfg) return null;

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

    const res = await this.request('session.send_transaction', {
      token: cfg.token,
      publicKey: payload.pubKey,
      sendingMode: 'TYPE_SYNC',
      encodedTransaction,
    });

    return res;
  }

  request(method: string, params: object) {
    return fetch(`${this.url}/api/${VERSION}/requests`, {
      method: 'post',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: `${this.id++}`,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  }

  private setConfig(cfg: ConnectorConfig) {
    LocalStorage.setItem(this.configKey, JSON.stringify(cfg));
  }

  private getConfig(): ConnectorConfig | null {
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
}
