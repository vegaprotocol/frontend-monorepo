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
    return res.keys;
  }

  // TODO: test this
  disconnect() {
    return window.vega.disconnectWallet();
  }

  // @ts-ignore TODO: test this
  async sendTx(pubKey: string, transaction: Transaction) {
    const result = await window.vega.sendTransaction({
      publicKey: 'foo',
      transaction,
      sendingMode: 'TYPE_SYNC',
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
