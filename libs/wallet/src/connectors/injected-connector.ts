import { clearConfig, getConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';

declare global {
  interface Window {
    vega: {
      getChainId: () => Promise<{ chainID: string }>;
      connectWallet: (params: { hostname: string }) => Promise<null>;
      disconnectWallet: () => Promise<void>;
      listKeys: () => Promise<{
        keys: Array<{ name: string; publicKey: string }>;
      }>;
      sendTransaction: (params: {
        publicKey: string;
        transaction: Transaction;
        sendingMode: 'TYPE_SYNC';
      }) => Promise<void>;
    };
  }
}

export class InjectedConnector implements VegaConnector {
  description = 'Connects using the Vega wallet browser extension';

  async getChainId() {
    return window.vega.getChainId();
  }

  connectWallet() {
    return window.vega.connectWallet({
      hostname: window.location.host,
    });
  }

  async connect() {
    const res = await window.vega.listKeys();
    setConfig({
      connector: 'injected',
      token: null, // no token required for injected
      url: null, // no url for injected
    });
    return res.keys;
  }

  disconnect() {
    clearConfig();
    return window.vega.disconnectWallet();
  }

  // TODO: this aint working
  async sendTx(pubKey: string, transaction: Transaction) {
    console.log(pubKey, transaction);
    const result = await window.vega.sendTransaction({
      publicKey: pubKey,
      transaction,
      sendingMode: 'TYPE_SYNC' as const,
    });
    console.log(result);
    // TODO: update me
    return {
      transactionHash: '',
      signature: '',
      receivedAt: '',
      sentAt: '',
    };
  }
}
