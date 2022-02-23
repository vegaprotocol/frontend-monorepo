import {
  DefaultApi,
  createConfiguration,
  Configuration,
  VegaKey,
} from '@vegaprotocol/vegawallet-service-api-client';
import { LocalStorage } from '@vegaprotocol/storage';

export interface VegaConnector {
  connect(): Promise<VegaKey[]>;
  disconnect(): Promise<void>;
}

export class RestConnector implements VegaConnector {
  apiConfig: Configuration;
  service: DefaultApi;

  constructor() {
    this.apiConfig = createConfiguration({
      authMethods: {
        bearer: `Bearer ${LocalStorage.getItem('vega_wallet_token')}`,
      },
    });
    this.service = new DefaultApi(this.apiConfig);
  }

  async authenticate(params: { wallet: string; passphrase: string }) {
    try {
      const tokenRes = await this.service.authTokenPost(params);

      // Renew DefaultApi now we have the token
      this.service = new DefaultApi(
        createConfiguration({
          authMethods: {
            bearer: `Bearer ${tokenRes.token}`,
          },
        })
      );

      LocalStorage.setItem('vega_wallet_token', tokenRes.token);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async connect() {
    const res = await this.service.keysGet();
    return res.keys;
  }

  async disconnect() {
    await this.service.authTokenDelete();
    LocalStorage.removeItem('vega_wallet_token');
  }
}

export class InjectedConnector implements VegaConnector {
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
