import {
  ConnectorError,
  chainIdError,
  connectError,
  disconnectError,
  isConnectedError,
  listKeysError,
  noWalletError,
  sendTransactionError,
} from '../errors';
import {
  type TransactionParams,
  type Connector,
  type VegaWalletEvent,
} from '../types';

export class InjectedConnector implements Connector {
  readonly id = 'injected';
  readonly name = 'Vega Wallet';
  readonly description =
    'Connect with Vega Wallet extension to access all features including key management and detailed transaction views from your browser.';

  bindStore() {}

  async connectWallet(chainId: string) {
    try {
      if (window.vega === undefined) {
        throw noWalletError('window.vega is undefined');
      }

      await window.vega.connectWallet({ chainId });
      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw connectError();
    }
  }

  async disconnectWallet() {
    try {
      await window.vega.disconnectWallet();
      return { success: true };
    } catch (err) {
      throw disconnectError();
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const res = await window.vega.getChainId();
      return { chainId: res.chainID };
    } catch (err) {
      throw chainIdError();
    }
  }

  async listKeys() {
    try {
      const res = await window.vega.listKeys();
      return res.keys;
    } catch (err) {
      throw listKeysError();
    }
  }

  async isConnected() {
    try {
      const res = await window.vega.isConnected();
      return { connected: res };
    } catch (err) {
      throw isConnectedError();
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const res = await window.vega.sendTransaction(params);

      return {
        transactionHash: res.transactionHash,
        signature: res.transaction.signature.value,
        receivedAt: res.receivedAt,
        sentAt: res.sentAt,
      };
    } catch (err) {
      throw sendTransactionError();
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    window.vega.on(event, callback);
  }

  off(event: VegaWalletEvent, callback: () => void) {
    window.vega.off(event, callback);
  }
}
