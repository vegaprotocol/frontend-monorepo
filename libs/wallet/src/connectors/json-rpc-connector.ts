import { type StoreApi } from 'zustand';
import { EventEmitter } from 'eventemitter3';
import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
  type Store,
  type VegaWalletEvent,
} from '../types';
import {
  ConnectorError,
  connectError,
  noWalletError,
  sendTransactionError,
  userRejectedError,
} from '../errors';

type JsonRpcConnectorConfig = { url: string; token?: string };

const USER_REJECTED_CODE = 3001;

export class JsonRpcConnector implements Connector {
  readonly id = 'jsonRpc';
  readonly name = 'Command Line Wallet';
  readonly description =
    'Connect using the command line wallet or the legacy desktop app.';

  url: string;
  requestId: number = 0;
  store: StoreApi<Store> | undefined;
  pollRef: NodeJS.Timer | undefined;
  ee: EventEmitter;

  constructor(config: JsonRpcConnectorConfig) {
    this.url = config.url;
    this.ee = new EventEmitter();
  }

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet(desiredChainId: string) {
    try {
      const chainRes = await this.getChainId();

      if ('error' in chainRes) {
        throw connectError('getChainId failed');
      }

      if (chainRes.chainId !== desiredChainId) {
        throw connectError(
          `desired chain is ${desiredChainId} but wallet chain is ${chainRes.chainId}`
        );
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
          if ('error' in data && data.error.code === USER_REJECTED_CODE) {
            throw userRejectedError();
          }
          throw connectError('response not ok');
        }

        if (!token) {
          throw connectError('no Authorization header');
        }

        this.token = token;
      }

      this.startPoll();
      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw noWalletError();
    }
  }

  async disconnectWallet() {
    try {
      this.stopPoll();
      await this.request(JsonRpcMethod.DisconnectWallet);
    } catch (err) {
      throw noWalletError();
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const { data } = await this.request(JsonRpcMethod.GetChainId);

      return { chainId: data.result.chainID };
    } catch (err) {
      this.stopPoll();
      throw noWalletError();
    }
  }

  async listKeys() {
    try {
      const { data } = await this.request(JsonRpcMethod.ListKeys);
      return data.result.keys as Array<{ publicKey: string; name: string }>;
    } catch (err) {
      this.stopPoll();
      throw noWalletError();
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
        if ('error' in data) {
          if (data.error.code === USER_REJECTED_CODE) {
            throw userRejectedError();
          }

          throw sendTransactionError(
            `${data.error.message}: ${data.error.data}`
          );
        }

        throw sendTransactionError('response not ok');
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

      throw noWalletError();
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    this.ee.on(event, callback);
  }

  off(event: VegaWalletEvent, callback?: () => void) {
    this.ee.off(event, callback);
  }

  ////////////////////////////////////
  // JSON rpc connector methods
  ////////////////////////////////////

  private startPoll() {
    // This only event we need to poll for right now is client.disconnect,
    // if more events get added we will need more logic here
    this.pollRef = setInterval(async () => {
      const result = await this.isConnected();
      if (result.connected) return;
      this.ee.emit('client.disconnected');
    }, 2000);
  }

  private stopPoll() {
    if (this.pollRef) {
      clearInterval(this.pollRef);
    }
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
