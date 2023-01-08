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
      this.pubkey = pubkey || cfg?.token
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
        name: 'View only address',
        publicKey: this.pubkey,
      },
    ]);
  }
  disconnect(): Promise<void> {
    clearConfig();
    this.pubkey = null
    return Promise.resolve()
  }
  sendTx(): Promise<TransactionResponse | null> {
    throw new Error('View only connector cannot be used to send transactions');
  }
}
