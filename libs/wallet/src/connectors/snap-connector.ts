import {
  ConnectorError,
  chainIdError,
  connectError,
  listKeysError,
  noWalletError,
  sendTransactionError,
  userRejectedError,
} from '../errors';
import { type Transaction } from '../transaction-types';
import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
} from '../types';

enum EthereumMethod {
  RequestSnaps = 'wallet_requestSnaps',
  GetSnaps = 'wallet_getSnaps',
  InvokeSnap = 'wallet_invokeSnap',
}

type SnapConfig = {
  node: string;
  version: string;
  snapId: string;
};

type SnapInvocationParams = Partial<{
  transaction: Transaction;
  publicKey: string;
  networkEndpoints: string[];
  sendingMode: 'TYPE_SYNC';
}>;

type RequestArguments = {
  method: string;
  params?: unknown[] | object;
};

declare global {
  type WindowEthereumProvider = {
    isMetaMask: boolean;
    request<T = unknown>(args: RequestArguments): Promise<T>;
  };

  interface Window {
    // @ts-ignore must have identical modifiers
    ethereum: WindowEthereumProvider;
  }
}

interface SnapRPCError {
  code: number;
  message: string;
  data?: {
    originalError: { code: number };
  };
}

const USER_REJECTED_CODE = -4;

export class SnapConnector implements Connector {
  readonly id = 'snap';
  readonly name = 'MetaMask Snap';
  readonly description =
    'Connect directly via MetaMask with the Vega Snap for single key support without advanced features.';

  node: string;
  version: string;
  snapId: string;

  // Note: apps may not know which node is selected on start up so its up
  // to the app to make sure class intances are renewed if the node changes
  constructor(config: SnapConfig) {
    this.node = config.node;
    this.version = config.version;
    this.snapId = config.snapId;
  }

  bindStore() {}

  async connectWallet(desiredChainId: string) {
    try {
      const res = await this.requestSnap();

      if (res[this.snapId].blocked) {
        throw connectError('snap is blocked');
      }

      if (!res[this.snapId].enabled) {
        throw connectError('snap is not enabled');
      }

      const { chainId } = await this.getChainId();

      if (chainId !== desiredChainId) {
        throw connectError(
          `desired chain is ${desiredChainId} but wallet chain is ${chainId}`
        );
      }

      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw noWalletError();
    }
  }

  async disconnectWallet() {}

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const data = await this.invokeSnap<{ chainID: string }>(
        JsonRpcMethod.GetChainId,
        {
          networkEndpoints: [this.node],
        }
      );

      if ('error' in data) {
        throw chainIdError(data.error.message);
      }

      return { chainId: data.chainID };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw chainIdError();
    }
  }

  async listKeys() {
    try {
      const data = await this.invokeSnap<{
        keys: Array<{ publicKey: string; name: string }>;
      }>(JsonRpcMethod.ListKeys);

      if ('error' in data) {
        throw listKeysError(data.error.message);
      }

      return data.keys;
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw listKeysError();
    }
  }

  async isConnected() {
    try {
      // If this throws its likely the snap is disabled or has been uninstalled
      await this.listKeys();
      return { connected: true };
    } catch (err) {
      return { connected: false };
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      // If the transaction is invalid this will throw with SnapRPCError
      // but if its rejected it will resolve with 'error' in data
      const data = await this.invokeSnap<{
        transactionHash: string;
        transaction: { signature: { value: string } };
        receivedAt: string;
        sentAt: string;
      }>(JsonRpcMethod.SendTransaction, {
        publicKey: params.publicKey,
        sendingMode: params.sendingMode,
        transaction: params.transaction,
        networkEndpoints: [this.node],
      });

      if ('error' in data) {
        if (data.error.code === USER_REJECTED_CODE) {
          throw userRejectedError();
        }

        throw sendTransactionError(`${data.error.message}: ${data.error.data}`);
      }

      return {
        transactionHash: data.transactionHash,
        signature: data.transaction.signature.value,
        receivedAt: data.receivedAt,
        sentAt: data.sentAt,
      };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      if (this.isSnapRPCError(err)) {
        throw sendTransactionError(err.message);
      }

      throw sendTransactionError();
    }
  }

  on() {}

  off() {}

  ////////////////////////////////////
  // Snap methods
  ////////////////////////////////////

  /**
   * Requests permission for a website to communicate with the specified snaps
   * and attempts to install them if they're not already installed.
   * If the installation of any snap fails, returns the error that caused the failure.
   * More informations here: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_requestsnaps
   */
  private async requestSnap(): Promise<{
    [snapId: string]: {
      blocked: boolean;
      enabled: boolean;
      id: string;
      version: string;
    };
  }> {
    return window.ethereum.request({
      method: EthereumMethod.RequestSnaps,
      params: {
        [this.snapId]: {
          version: this.version,
        },
      },
    });
  }

  /**
   * Calls a method on the specified snap, always vega in this case
   * should always be npm:@vegaprotocol/snap
   */
  private async invokeSnap<TResult>(
    method: JsonRpcMethod,
    params: SnapInvocationParams = {}
  ): Promise<TResult | { error: SnapRPCError }> {
    // MetaMask in Firefox doesn't like undefined properties or some properties
    // on __proto__ so we need to strip them out with JSON.strinfify
    params = JSON.parse(JSON.stringify(params));

    return window.ethereum.request({
      method: EthereumMethod.InvokeSnap,
      params: {
        snapId: this.snapId,
        request: {
          method,
          params,
        },
      },
    });
  }

  private isSnapRPCError(obj: unknown): obj is SnapRPCError {
    if (
      obj !== undefined &&
      obj !== null &&
      typeof obj === 'object' &&
      'code' in obj &&
      'message' in obj
    ) {
      return true;
    }
    return false;
  }
}
