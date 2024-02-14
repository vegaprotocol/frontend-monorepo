import { type StoreApi } from 'zustand';
import { type Store, type Connector } from '../types';

export class ReadOnlyConnector implements Connector {
  readonly id = 'readOnly';

  store: StoreApi<Store> | undefined;

  constructor(pubKey?: string) {
    if (pubKey) {
      this.pubKey = pubKey;
    }
  }

  bindStore(store: StoreApi<Store>) {
    this.store = store;
  }

  async connectWallet() {
    if (!this.pubKey) {
      const pubKey = window.prompt('Enter pubkey');

      if (!pubKey) {
        return { error: 'the user rejected' };
      }

      // TODO validate pubkey

      this.pubKey = pubKey;
    }
    return { success: true };
  }

  async disconnectWallet() {
    this.pubKey = undefined;
    return { success: true };
  }

  async getChainId() {
    return {
      error: `You are connected in a view only state for public key: ${this.pubKey}`,
    };
  }

  async listKeys() {
    if (!this.pubKey) {
      return { error: 'failed to list keys' };
    }
    return [
      {
        name: 'View only',
        publicKey: this.pubKey,
      },
    ];
  }

  async isConnected() {
    if (this.pubKey) {
      return { connected: true };
    }

    return { connected: false };
  }

  // @ts-ignore deliberate fail
  async sendTransaction() {
    return {
      error: `You are connected in a view only state for public key: ${this.pubKey}. In order to send transactions you must connect to a real wallet.`,
    };
  }

  on() {
    console.warn('events are not supported using a read only connection');
  }

  off() {
    console.warn('events are not supported using a read only connection');
  }

  get pubKey() {
    return this.store?.getState().pubKey;
  }

  set pubKey(value: string | undefined) {
    this.store?.setState({ pubKey: value });
  }
}
