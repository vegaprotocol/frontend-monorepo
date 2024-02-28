import { type StoreApi } from 'zustand';
import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
  type Store,
  type VegaWalletEvent,
} from '../types';
import { ConnectorError, ConnectorErrors } from '../errors';

type JsonRpcConnectorConfig = { url: string; token?: string };

export class JsonRpcConnector implements Connector {
  readonly id = 'jsonRpc';
  readonly name = 'Command Line Wallet';
  readonly description =
    'Connect using the command line wallet or the legacy desktop app.';

  url: string;
  requestId: number = 0;
  store: StoreApi<Store> | undefined;
  pollRef: NodeJS.Timer | undefined;
  pollListeners: Record<VegaWalletEvent, (() => void)[]> = {
    'client.disconnected': [],
  };

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

      this.startPoll();
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
      this.stopPoll();
      await this.request(JsonRpcMethod.DisconnectWallet);
      return { success: true };
    } catch (err) {
      throw ConnectorErrors.noWallet;
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const { data } = await this.request(JsonRpcMethod.GetChainId);

      return { chainId: data.result.chainID };
    } catch (err) {
      this.stopPoll();
      throw ConnectorErrors.noWallet;
    }
  }

  async listKeys() {
    try {
      const { data } = await this.request(JsonRpcMethod.ListKeys);
      return data.result.keys as Array<{ publicKey: string; name: string }>;
    } catch (err) {
      this.stopPoll();
      throw ConnectorErrors.noWallet;
    }
  }

  async isConnected() {
    try {
      await this.listKeys();
      return { connected: true };
    } catch {
      this.stopPoll();
      return { connected: false };
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const { response, data } = await this.request(
        JsonRpcMethod.SendTransaction,
        params
      );

      if (!response.ok) {
        if ('error' in data && data.error.code === 3001) {
          throw ConnectorErrors.userRejected;
        }
        throw ConnectorErrors.sendTransaction;
      }

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

      throw ConnectorErrors.noWallet;
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    this.pollListeners[event].push(callback);
  }

  off(event: VegaWalletEvent, callback?: () => void) {
    this.pollListeners[event] = this.pollListeners[event].filter(
      (cb) => cb !== callback
    );
  }

  ////////////////////////////////////
  // JSON rpc connector methods
  ////////////////////////////////////

  startPoll() {
    // This only event we need to poll for right now is client.disconnect,
    // if more events get added we will need more logic here
    this.pollRef = setInterval(async () => {
      const result = await this.isConnected();
      if (result.connected) return;
      this.emit('client.disconnected');
    }, 2000);
  }

  stopPoll() {
    if (this.pollRef) {
      clearInterval(this.pollRef);
    }
  }

  emit(event: VegaWalletEvent) {
    this.pollListeners[event].forEach((listener) => {
      listener();
    });
  }

  // TODO: fix any
  // eslint-disable-next-line
  private async request(method: JsonRpcMethod, params?: any) {
    const headers = new Headers();

    if (this.token) {
      headers.set('Authorization', this.token);
    }

    const response = await fetch(`${this.url}/api/v2/requests`, {
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
