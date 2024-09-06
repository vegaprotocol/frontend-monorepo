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
import EventEmitter from 'eventemitter3';

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

class BrowserConnector {
  store: StoreApi<Store> | undefined;

  private static client = new JSONRPCClient({
    idPrefix: 'vega.in-page-',
    send(msg: unknown) {
      window.dispatchEvent(
        new CustomEvent('content-script', {
          detail: msg,
        })
      );
    },
    onnotification: (msg) => {
      BrowserConnector.emitter.emit(msg.method, msg.params);
    },
  });

  private static emitter = new EventEmitter();

  private static onMessage = (event: Event) => {
    const msg = (event as CustomEvent).detail;
    BrowserConnector.client.onmessage(msg);
  };

  /**
   *
   */
  constructor() {
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'content-script-response',
        BrowserConnector.onMessage
      );
      window.addEventListener(
        'content-script-response',
        BrowserConnector.onMessage
      );
    }
  }

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet(chainId?: string): Promise<{ success: boolean }> {
    try {
      await BrowserConnector.client.request('client.connect_wallet', {
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
      await BrowserConnector.client.request('client.disconnect_wallet', null);
    } catch (err) {
      throw disconnectError();
    }
  }

  async getChainId(): Promise<{ chainId: string }> {
    try {
      const res = (await BrowserConnector.client.request(
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
      const res = (await BrowserConnector.client.request(
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
      const res = (await BrowserConnector.client.request(
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
      const res = await InBrowserConnector.client.request(
        'client.send_transaction',
        params
      );
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

  on(event: VegaWalletEvent, callback: () => void): void {
    InBrowserConnector.emitter.on(event, callback);
  }

  off(event: VegaWalletEvent, callback?: () => void): void {
    InBrowserConnector.emitter.off(event, callback);
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

export class InBrowserConnector extends BrowserConnector implements Connector {
  readonly id = 'in-browser-wallet';
  name = 'Embedded wallet';
  description = 'Connect with Embedded Vega Wallet to get started quickly';
  prominent = false;
}

export class QuickStartConnector extends BrowserConnector implements Connector {
  // TODO this ID is wrongggggg
  readonly id = 'in-browser-wallet-quickstart';
  name = 'Quickstart wallet';
  description =
    'Generate credentials using an Ethereum wallet and start using Vega';
  prominent = true;

  static adminClient = new JSONRPCClient({
    idPrefix: 'vega.popup-',
    send(msg: unknown) {
      window.dispatchEvent(
        new CustomEvent('popup', {
          detail: msg,
        })
      );
    },
    onnotification: () => {},
  });

  private static onAdminMessage = (event: Event) => {
    const msg = (event as CustomEvent).detail;
    QuickStartConnector.adminClient.onmessage(msg);
  };

  /**
   *
   */
  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'popup-response',
        QuickStartConnector.onAdminMessage
      );
      window.addEventListener(
        'popup-response',
        QuickStartConnector.onAdminMessage
      );
    }
  }

  async importWallet(mnemonic: string) {
    try {
      const res = await QuickStartConnector.adminClient.request(
        'admin.import_wallet',
        {
          recoveryPhrase: mnemonic,
          name: 'Wallet',
        }
      );
      // eslint-disable-next-line no-console
      console.log(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }
}
