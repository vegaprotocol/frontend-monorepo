import { type StoreApi } from 'zustand';
import { type Store, type Connector } from '../types';
import { isValidVegaPublicKey } from '@vegaprotocol/utils';
import {
  ConnectorError,
  chainIdError,
  connectError,
  listKeysError,
  sendTransactionError,
  userRejectedError,
} from '../errors';
import { type TransactionResponse } from '../transaction-types';

export class ViewPartyConnector implements Connector {
  readonly id = 'viewParty';
  readonly name = 'View as public key';
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
        throw userRejectedError();
      }

      if (!isValidVegaPublicKey(value)) {
        throw connectError('invalid public key');
      }

      this.pubKey = value;

      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw connectError();
    }
  }

  async disconnectWallet() {
    this.pubKey = undefined;
  }

  async getChainId(): Promise<{ chainId: string }> {
    throw chainIdError('view party connector has not reference to a chain');
  }

  async listKeys() {
    if (!this.pubKey) {
      throw listKeysError();
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

  // define return type here to appease typescript, even though it'll only throw
  async sendTransaction(): Promise<TransactionResponse> {
    throw sendTransactionError(
      'cannot send transactions when using view party connector'
    );
  }

  on() {
    console.warn('events are not supported using a view party connection');
  }

  off() {
    console.warn('events are not supported using a view party connection');
  }

  get pubKey() {
    return this.store?.getState().pubKey;
  }

  set pubKey(value: string | undefined) {
    this.store?.setState({ pubKey: value });
  }
}
