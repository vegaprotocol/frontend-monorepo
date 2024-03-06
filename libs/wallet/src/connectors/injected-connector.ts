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
    | string;
}

const USER_REJECTED_CODE = -4;

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
      if (this.isInjectedError(err)) {
        if (err.code === USER_REJECTED_CODE) {
          throw userRejectedError();
        }

        if (typeof err.data === 'string') {
          throw sendTransactionError(err.data);
        } else {
          throw sendTransactionError(err.data.message);
        }
      }

      throw sendTransactionError();
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    window.vega.on(event, callback);
  }

  off(event: VegaWalletEvent, callback: () => void) {
    window.vega.off(event, callback);
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
