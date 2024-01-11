import type {
  PubKey,
  TransactionResponse,
  VegaConnector,
} from './vega-connector';
import { clearConfig, getConfig, setConfig } from '../storage';

export class ViewConnector implements VegaConnector {
  url: string | null;
  pubkey: string | null | undefined = null;

  /**
   *
   */
  constructor(pubkey?: string | null) {
    this.url = 'view-only';
    const cfg = getConfig();

    if (pubkey || cfg?.token) {
      this.pubkey = pubkey || cfg?.token;
    }
  }
  setPubkey(pubkey: string) {
    this.pubkey = pubkey;
  }
  connect(): Promise<PubKey[] | null> {
    if (!this.pubkey) {
      throw new Error('Cannot connect until address is set first');
    }
    setConfig({
      token: this.pubkey,
      connector: 'view',
      url: this.url,
    });
    return Promise.resolve([
      {
        name: 'View only',
        publicKey: this.pubkey,
      },
    ]);
  }

  async isAlive() {
    return true;
  }

  disconnect(): Promise<void> {
    clearConfig();
    this.pubkey = null;
    return Promise.resolve();
  }
  sendTx(): Promise<TransactionResponse | null> {
    throw new Error(
      `You are connected in a view only state for public key: ${this.pubkey}. In order to send transactions you must connect to a real wallet.`
    );
  }
}
