import { clearConfig, setConfig } from '../storage';
import type { Transaction, VegaConnector } from './vega-connector';

type VegaWalletEvent = 'client.disconnected';

declare global {
  interface Vega {
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
    isConnected?: () => Promise<boolean>;
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

const wait = (ms: number) =>
  new Promise<boolean>((_, reject) => {
    setTimeout(() => {
      reject(false);
    }, ms);
  });

const INJECTED_CONNECTOR_TIMEOUT = 1000;

export class InjectedConnector implements VegaConnector {
  isConnected = false;
  chainId: string | null = null;
  description = 'Connects using the Vega wallet browser extension';
  alive: ReturnType<typeof setInterval> | undefined = undefined;

  async connectWallet(chainId: string) {
    this.chainId = chainId;
    try {
      await window.vega.connectWallet({ chainId });
      this.isConnected = true;
      window.vega.on('client.disconnected', () => {
        this.isConnected = false;
      });

      this.alive = setInterval(async () => {
        try {
          const connected = await Promise.race([
            wait(INJECTED_CONNECTOR_TIMEOUT),
            // `isConnected` is only available in the newer versions
            // of the browser wallet
            'isConnected' in window.vega &&
            typeof window.vega.isConnected === 'function'
              ? window.vega.isConnected()
              : window.vega.listKeys(),
          ]);
          this.isConnected = Boolean(connected);
        } catch {
          this.isConnected = false;
        }
      }, INJECTED_CONNECTOR_TIMEOUT * 2);
    } catch {
      throw new Error(
        `could not connect to the vega wallet on chain: ${chainId}`
      );
    }
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
    return this.isConnected;
  }

  disconnect() {
    clearInterval(this.alive);
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
