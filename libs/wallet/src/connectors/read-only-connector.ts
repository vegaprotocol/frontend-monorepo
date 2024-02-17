import { type StoreApi } from 'zustand';
import { type Store, type Connector } from '../types';
import { isValidVegaPublicKey } from '@vegaprotocol/utils';
import { ConnectorError, ConnectorErrors } from '.';

export class ReadOnlyConnector implements Connector {
  readonly id = 'readOnly';
  readonly name = 'Read Only';
  readonly description = 'Provide a public key to connect in read only mode.';

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
    try {
      if (this.pubKey) {
        return { success: true };
      }

      const value = window.prompt('Enter public key');

      if (value === null) {
        throw ConnectorErrors.userRejected;
      }

      // TODO: extend connect error with messaging for invalid public key
      if (!isValidVegaPublicKey(value)) {
        // throw new Error('invalid public key');
        throw ConnectorErrors.connect;
      }

      this.pubKey = value;

      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw ConnectorErrors.connect;
    }
  }

  async disconnectWallet() {
    this.pubKey = undefined;
    return { success: true };
  }

  // @ts-ignore read only connector has no reference to a chain
  async getChainId() {
    throw ConnectorErrors.chainId;
  }

  async listKeys() {
    if (!this.pubKey) {
      throw ConnectorErrors.listKeys;
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
    // TODO: extend send tx with more information
    //
    // return {
    //   error: `You are connected in a view only state for public key: ${this.pubKey}. In order to send transactions you must connect to a real wallet.`,
    // };
    throw ConnectorErrors.sendTransaction;
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
