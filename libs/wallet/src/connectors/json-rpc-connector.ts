import { type StoreApi } from 'zustand';
import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
  type Store,
} from '../types';

type JsonRpcConnectorConfig = { url: string; token?: string };

export class JsonRpcConnector implements Connector {
  readonly id = 'jsonRpc';

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
        return { error: chainRes.error };
      }

      if (chainRes.chainId !== desiredChainId) {
        return { error: 'incorrect chain' };
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
          if ('error' in data) {
            return { error: data.error.data };
          }

          return { error: 'failed to connect' };
        }

        if (!token) {
          return { error: 'failed to connect' };
        }

        this.token = token;
      }

      return { success: true };
    } catch (err) {
      return { error: 'wallet not running' };
    }
  }

  async disconnectWallet() {
    try {
      await this.request(JsonRpcMethod.DisconnectWallet);
      return { success: true };
    } catch (err) {
      return { error: 'wallet not running' };
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const { data } = await this.request(JsonRpcMethod.GetChainId);

      return { chainId: data.result.chainID };
    } catch (err) {
      return { error: 'wallet not running' };
    }
  }

  async listKeys() {
    try {
      const { data } = await this.request(JsonRpcMethod.ListKeys);
      return data.result.keys as Array<{ publicKey: string; name: string }>;
    } catch (err) {
      return { error: 'wallet not running' };
    }
  }

  async isConnected() {
    try {
      await this.listKeys();
      return { connected: true };
    } catch (err) {
      return { error: 'wallet not running' };
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const { data } = await this.request(
        JsonRpcMethod.SendTransaction,
        params
      );

      return {
        transactionHash: data.result.transactionHash,
        signature: data.result.transaction.signature.value,
        receivedAt: data.result.receivedAt,
        sentAt: data.result.sentAt,
      };
    } catch (err) {
      return { error: 'wallet not running' };
    }
  }

  on() {
    console.warn('events are not supported in json rpc wallet');
  }

  off() {
    console.warn('events are not supported in json rpc wallet');
  }

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
