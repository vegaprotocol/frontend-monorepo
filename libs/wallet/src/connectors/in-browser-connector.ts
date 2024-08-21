import { type StoreApi } from 'zustand';
import { type TransactionResponse } from '../transaction-types';
import {
  type Store,
  type TransactionParams,
  type VegaWalletEvent,
  type Connector,
} from '../types';
import { JSONRPCClient } from '@vegaprotocol/json-rpc';
import {
  chainIdError,
  connectError,
  ConnectorError,
  disconnectError,
  isConnectedError,
  listKeysError,
  sendTransactionError,
  userRejectedError,
} from '../errors';

interface InjectedError {
  message: string;
  code: number;
  data:
    | {
        message: string;
        code: number;
      }
    | string[]
    | string;
}

const USER_REJECTED_CODE = -4;

const client = new JSONRPCClient({
  idPrefix: 'vega.in-page-',
  send(msg: unknown) {
    window.dispatchEvent(
      new CustomEvent('content-script', {
        detail: msg,
      })
    );
  },
  onnotification: (msg: unknown) => {
    // eslint-disable-next-line no-console
    console.log('onntification', msg);
  },
});

export class InBrowserConnector implements Connector {
  // @ts-ignore -- will be fixed on rewrite of the jsonrpc client to typescript
  readonly client = client;
  readonly id = 'in-browser-wallet';
  readonly name = 'In browser wallet';
  readonly description =
    'Connect with In Browser Vega Wallet to get started quickly';
  store: StoreApi<Store> | undefined;

  /**
   *
   */
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('content-script-response', (event) => {
        const msg = (event as CustomEvent).detail;
        client.onmessage(msg);
      });
    }
  }

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet(chainId?: string): Promise<{ success: boolean }> {
    try {
      await this.client.request('client.connect_wallet', {
        chainId,
      });
      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      if (this.isInjectedError(err)) {
        throw connectError(err.message);
      }

      throw connectError();
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await client.request('client.disconnect_wallet', null);
    } catch (err) {
      throw disconnectError();
    }
  }

  async getChainId(): Promise<{ chainId: string }> {
    try {
      const res = (await client.request(
        'client.get_chain_id',
        null
      )) as unknown as {
        chainId: string;
      };
      return res;
    } catch (err) {
      throw chainIdError();
    }
  }

  async listKeys(): Promise<Array<{ publicKey: string; name: string }>> {
    try {
      const res = (await client.request(
        'client.list_keys',
        null
      )) as unknown as {
        keys: Array<{ publicKey: string; name: string }>;
      };
      return res.keys;
    } catch (err) {
      throw listKeysError();
    }
  }

  async isConnected(): Promise<{ connected: boolean }> {
    try {
      const res = (await client.request(
        'client.is_connected',
        null
      )) as unknown as {
        connected: boolean;
      };
      return res;
    } catch (err) {
      if (this.isInjectedError(err)) {
        throw connectError(err.message);
      }

      throw isConnectedError();
    }
  }

  async sendTransaction(
    params: TransactionParams
  ): Promise<TransactionResponse> {
    try {
      const res = await client.request('client.send_transaction', params);
      return res as TransactionResponse;
    } catch (err) {
      if (this.isInjectedError(err)) {
        if (err.code === USER_REJECTED_CODE) {
          throw userRejectedError();
        }

        throw sendTransactionError(JSON.stringify(err.data));
      }

      throw sendTransactionError();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  on(event: VegaWalletEvent, callback: () => void): void {
    // throw new Error('Method not implemented.');
    // TODO fix
    // console.log('NOOP, event listener not implemented yet');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  off(event: VegaWalletEvent, callback?: () => void): void {
    // throw new Error('Method not implemented.');
    // TODO fix
    // console.log('NOOP, event listener not implemented yet');
  }

  private isInjectedError(obj: unknown): obj is InjectedError {
    if (
      obj !== undefined &&
      obj !== null &&
      typeof obj === 'object' &&
      'code' in obj &&
      'message' in obj &&
      'data' in obj
    ) {
      return true;
    }
    return false;
  }
}
