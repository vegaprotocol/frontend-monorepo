import {
  ConnectorError,
  chainIdError,
  connectError,
  disconnectError,
  isConnectedError,
  listKeysError,
  noWalletError,
  sendTransactionError,
  userRejectedError,
} from '../errors';
import {
  type TransactionParams,
  type Connector,
  type VegaWalletEvent,
} from '../types';

interface InjectedError {
  message: string;
  code: number;
  data:
    | {
        message: string;
        code: number;
      }
    | string[]
    | string;
}

const USER_REJECTED_CODE = -4;

export class InjectedConnector implements Connector {
  readonly id = 'injected';
  name = 'Vega Wallet';
  description =
    'Connect with Vega Wallet extension to access all features including key management and detailed transaction views from your browser.';
  prominent = true;

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

      if (this.isInjectedError(err)) {
        throw connectError(err.message);
      }

      throw connectError();
    }
  }

  async disconnectWallet() {
    try {
      await window.vega.disconnectWallet();
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
      if (this.isInjectedError(err)) {
        throw connectError(err.message);
      }

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
      if (this.isInjectedError(err)) {
        throw connectError(err.message);
      }

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
      if (this.isInjectedError(err)) {
        if (err.code === USER_REJECTED_CODE) {
          throw userRejectedError();
        }

        throw sendTransactionError(JSON.stringify(err.data));
      }

      throw sendTransactionError();
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    // Check for on/off in case user is on older versions which don't support it
    // We can remove this check once FF is at the latest version
    if (
      typeof window.vega !== 'undefined' &&
      typeof window.vega.on === 'function'
    ) {
      window.vega.on(event, callback);
    }
  }

  off(event: VegaWalletEvent, callback: () => void) {
    // Check for on/off in case user is on older versions which don't support it
    // We can remove this check once FF is at the latest version
    if (
      typeof window.vega !== 'undefined' &&
      typeof window.vega.off === 'function'
    ) {
      window.vega.off(event, callback);
    }
  }

  private isInjectedError(obj: unknown): obj is InjectedError {
    if (
      obj !== undefined &&
      obj !== null &&
      typeof obj === 'object' &&
      'code' in obj &&
      'message' in obj &&
      'data' in obj
    ) {
      return true;
    }
    return false;
  }
}
