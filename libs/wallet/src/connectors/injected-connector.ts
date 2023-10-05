import { clearConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';

declare global {
  interface Vega {
    getChainId: () => Promise<{ chainID: string }>;
    connectWallet: () => Promise<null>;
    disconnectWallet: () => Promise<void>;
    listKeys: () => Promise<{
      keys: Array<{ name: string; publicKey: string }>;
    }>;
    sendTransaction: (params: {
      publicKey: string;
      transaction: Transaction;
      sendingMode: 'TYPE_SYNC';
    }) => Promise<{
      receivedAt: string;
      sentAt: string;
      transaction: {
        from: {
          pubKey: string;
        };
        inputData: string;
        pow: {
          tid: string;
          nonce: string;
        };
        signature: {
          algo: string;
          value: string;
          version: number;
        };
        version: number;
      };
      transactionHash: string;
    }>;
  }

  interface Window {
    vega: Vega;
  }
}

export const InjectedConnectorErrors = {
  USER_REJECTED: new Error('Connection denied'),
  VEGA_UNDEFINED: new Error('window.vega not found'),
  INVALID_CHAIN: new Error('Invalid chain'),
};

export class InjectedConnector implements VegaConnector {
  description = 'Connects using the Vega wallet browser extension';

  async getChainId() {
    return window.vega.getChainId();
  }

  connectWallet() {
    return window.vega.connectWallet();
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

  async sendTx(pubKey: string, transaction: Transaction) {
    const result = await window.vega.sendTransaction({
      publicKey: pubKey,
      transaction,
      sendingMode: 'TYPE_SYNC' as const,
    });
    return {
      transactionHash: result.transactionHash,
      receivedAt: result.receivedAt,
      sentAt: result.sentAt,
      signature: result.transaction.signature.value,
    };
  }
}
