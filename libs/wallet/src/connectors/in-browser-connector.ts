import { type StoreApi } from 'zustand';
import { type TransactionResponse } from '../transaction-types';
import {
  type Store,
  type TransactionParams,
  type VegaWalletEvent,
  type Connector,
} from '../types';
// @ts-ignore -- need to rewrite this JS client file to TS at a later date
import { JSONRPCClient } from './json-rpc-client';

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
    //   events.emit(msg.method, msg.params);
  },
});

if (typeof window !== 'undefined') {
  window.addEventListener('content-script-response', (event) => {
    const msg = (event as CustomEvent).detail;
    client.onmessage(msg);
  });
}

export class InBrowserConnector implements Connector {
  // @ts-ignore -- will be fixed on rewrite of the jsonrpc client to typescript
  readonly client = client;
  readonly id = 'in-browser-wallet';
  readonly name = 'In browser wallet';
  readonly description =
    'Connect with In Browser Vega Wallet to get started quickly';
  store: StoreApi<Store> | undefined;

  private messageId = 1;

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet(chainId?: string): Promise<{ success: boolean }> {
    try {
      await this.client.request('client.connect_wallet', {
        chainId,
      });
      return { success: true };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return { success: false };
    }
  }

  async disconnectWallet(): Promise<void> {
    return client.request('client.disconnect_wallet', null);
  }

  async getChainId(): Promise<{ chainId: string }> {
    return client.request('client.get_chain_id', null);
  }

  async listKeys(): Promise<Array<{ publicKey: string; name: string }>> {
    const res = await client.request('client.list_keys', null);
    return res.keys;
  }

  async isConnected(): Promise<{ connected: boolean }> {
    return client.request('client.is_connected', null);
  }

  async sendTransaction(
    params: TransactionParams
  ): Promise<TransactionResponse> {
    return client.request('client.send_transaction', params);
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
}
