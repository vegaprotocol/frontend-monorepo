import { clearConfig, getConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';

declare global {
  interface Vega {
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
    }) => Promise<{
      code: number;
      data: string;
      height: string;
      log: string;
      success: boolean;
      txHash: string;
    }>;
  }

  interface Window {
    vega: Vega;
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

  async sendTx(pubKey: string, transaction: Transaction) {
    const result = await window.vega.sendTransaction({
      publicKey: pubKey,
      transaction,
      sendingMode: 'TYPE_SYNC' as const,
    });
    console.log(result);
    // TODO: test this when updated to actually return values
    return {
      transactionHash: result.txHash,
      receivedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      signature: result.data,
    };
  }
}
