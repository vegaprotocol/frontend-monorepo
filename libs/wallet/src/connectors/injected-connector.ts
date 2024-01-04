import { clearConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';

type VegaWalletEvent = 'disconnect';

declare global {
  interface Vega {
    /**
     * @deprecated
     */
    getChainId: () => Promise<{ chainID: string }>;
    connectWallet: (args: { chainId: string }) => Promise<null>;
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

    on: (event: VegaWalletEvent, callback: () => void) => void;
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
  isConnected = false;
  chainId: string | null = null;
  description = 'Connects using the Vega wallet browser extension';

  /**
   * @deprecated
   */
  async getChainId() {
    return window.vega.getChainId();
  }

  async connectWallet(chainId: string) {
    this.chainId = chainId;
    try {
      await window.vega.connectWallet({ chainId });
      this.isConnected = true;
    } catch {
      throw new Error(
        `could not connect to the vega wallet on chain: ${chainId}`
      );
    }
  }

  onDisconnect(cb: () => void) {
    window.vega.on('disconnect', () => {
      this.isConnected = false;
      cb();
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

  async isAlive() {
    try {
      const keys = await window.vega.listKeys();
      if (keys.keys.length > 0) {
        return true;
      }
    } catch (err) {
      return false;
    }

    return false;
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
