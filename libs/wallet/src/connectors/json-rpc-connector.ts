import { LocalStorage } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from './vega-connector';

export class JsonRpcConnector implements VegaConnector {
  description = 'V2 Vega wallet';
  id = 0;

  async sessionActive() {
    return Boolean(LocalStorage.getItem('vegatoken'));
  }

  async startSession() {
    const result = await this.request('session.connect_wallet', {
      hostname: window.location.host,
    });

    if ('error' in result) {
      return result;
    } else {
      LocalStorage.setItem('vegatoken', result.result.token);
      return result;
    }
  }

  async getPermissions() {
    const perms = await this.request('session.get_permissions', {
      token: LocalStorage.getItem('vegatoken'),
    });

    return perms;
  }

  async requestPermissions() {
    const reqPerms = await this.request('session.request_permissions', {
      token: LocalStorage.getItem('vegatoken'),
      requestedPermissions: {
        public_keys: 'read',
      },
    });

    return reqPerms;
  }

  async connect() {
    const keys = await this.request('session.list_keys', {
      token: LocalStorage.getItem('vegatoken'),
    });
    return keys.result.keys;
  }

  async disconnect() {
    LocalStorage.removeItem('vegatoken');
    const result = await this.request('session.disconnect_wallet', {
      token: LocalStorage.getItem('vegatoken'),
    });
    return result;
  }

  // @ts-ignore v2 wallet api return types differ from v1
  async sendTx(publicKey: string, encodedTransaction: string) {
    const res = await this.request('session.send_transaction', {
      token: LocalStorage.getItem('vegatoken'),
      publicKey,
      sendingMode: 'TYPE_SYNC',
      encodedTransaction,
    });

    console.log(res);

    return res;
  }

  request(method: string, params: object) {
    return fetch('http://localhost:1789/api/v2/requests', {
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
}
