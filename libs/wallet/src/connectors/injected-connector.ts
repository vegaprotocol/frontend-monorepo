import { ConnectorError, ConnectorErrors } from '../errors';
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
        throw ConnectorErrors.noWallet;
      }

      await window.vega.connectWallet({ chainId });
      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw ConnectorErrors.connect;
    }
  }

  async disconnectWallet() {
    try {
      await window.vega.disconnectWallet();
      return { success: true };
    } catch (err) {
      throw ConnectorErrors.disconnect;
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const res = await window.vega.getChainId();
      return { chainId: res.chainID };
    } catch (err) {
      throw ConnectorErrors.chainId;
    }
  }

  async listKeys() {
    try {
      const res = await window.vega.listKeys();
      return res.keys;
    } catch (err) {
      throw ConnectorErrors.listKeys;
    }
  }

  async isConnected() {
    try {
      const res = await window.vega.isConnected();
      return { connected: res };
    } catch (err) {
      throw ConnectorErrors.isConnected;
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
      throw ConnectorErrors.isConnected;
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    window.vega.on(event, callback);
  }

  off(event: VegaWalletEvent, callback: () => void) {
    window.vega.off(event, callback);
  }
}
