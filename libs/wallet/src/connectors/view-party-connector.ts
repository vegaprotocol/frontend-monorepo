import { type StoreApi } from 'zustand';
import { type Store, type Connector } from '../types';
import { isValidVegaPublicKey } from '@vegaprotocol/utils';
import { ConnectorError, ConnectorErrors } from '.';
import { type TransactionResponse } from '../transaction-types';

export class ViewPartyConnector implements Connector {
  readonly id = 'viewParty';
  readonly name = 'View party';
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

  // define return type here to appease typescript, even though it'll only throw
  async getChainId(): Promise<{ chainId: string }> {
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

  // define return type here to appease typescript, even though it'll only throw
  async sendTransaction(): Promise<TransactionResponse> {
    // TODO: extend send tx with more information
    //
    // return {
    //   error: `You are connected in a view only state for public key: ${this.pubKey}. In order to send transactions you must connect to a real wallet.`,
    // };
    throw ConnectorErrors.sendTransaction;
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
