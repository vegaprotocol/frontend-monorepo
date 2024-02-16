import { type StoreApi } from 'zustand';
import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
  type Store,
} from '../types';
import { ConnectorError, ConnectorErrors } from '.';

type JsonRpcConnectorConfig = { url: string; token?: string };

export class JsonRpcConnector implements Connector {
  readonly id = 'jsonRpc';
  readonly name = 'Command Line Wallet';
  readonly description =
    'Connect using the command line wallet or the legacy desktop app.';

  url: string;
  requestId: number = 0;
  store: StoreApi<Store> | undefined;

  constructor(config: JsonRpcConnectorConfig) {
    this.url = config.url;
  }

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet(desiredChainId: string) {
    try {
      const chainRes = await this.getChainId();

      if ('error' in chainRes) {
        throw ConnectorErrors.chainId;
      }

      if (chainRes.chainId !== desiredChainId) {
        throw ConnectorErrors.chainId;
      }

      if (!this.token) {
        const { response, data } = await this.request(
          JsonRpcMethod.ConnectWallet,
          {
            hostname: window.location.hostname,
          }
        );

        const token = response.headers.get('Authorization');

        if (!response.ok) {
          // TODO: extend ConnectorError with data on jsonrpc error
          if ('error' in data && data.error.code === 3001) {
            // user rejected
            throw ConnectorErrors.userRejected;
          }
          throw ConnectorErrors.connect;
        }

        if (!token) {
          throw ConnectorErrors.connect;
        }

        this.token = token;
      }

      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw ConnectorErrors.noConnector;
    }
  }

  async disconnectWallet() {
    try {
      await this.request(JsonRpcMethod.DisconnectWallet);
      return { success: true };
    } catch (err) {
      throw ConnectorErrors.disconnect;
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const { data } = await this.request(JsonRpcMethod.GetChainId);

      return { chainId: data.result.chainID };
    } catch (err) {
      throw ConnectorErrors.chainId;
    }
  }

  async listKeys() {
    try {
      const { data } = await this.request(JsonRpcMethod.ListKeys);
      return data.result.keys as Array<{ publicKey: string; name: string }>;
    } catch (err) {
      throw ConnectorErrors.noConnector;
    }
  }

  async isConnected() {
    try {
      await this.listKeys();
      return { connected: true };
    } catch (err) {
      throw ConnectorErrors.noConnector;
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const { data } = await this.request(
        JsonRpcMethod.SendTransaction,
        params
      );

      // TODO handle not okay responses but wallet is running

      return {
        transactionHash: data.result.transactionHash,
        signature: data.result.transaction.signature.value,
        receivedAt: data.result.receivedAt,
        sentAt: data.result.sentAt,
      };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw ConnectorErrors.noConnector;
    }
  }

  on() {
    console.warn('events are not supported in json rpc wallet');
  }

  off() {
    console.warn('events are not supported in json rpc wallet');
  }

  // TODO: fix any
  // eslint-disable-next-line
  private async request(method: JsonRpcMethod, params?: any) {
    const headers = new Headers();

    if (this.token) {
      headers.set('Authorization', this.token);
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: `${this.requestId++}`,
        jsonrpc: '2.0',
        method,
        params,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      this.token = undefined;
    }

    return {
      data,
      response,
    };
  }

  get token() {
    return this.store?.getState().jsonRpcToken;
  }

  set token(value: string | undefined) {
    this.store?.setState({ jsonRpcToken: value });
  }
}
