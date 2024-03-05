import EventEmitter from 'eventemitter3';
import {
  ConnectorError,
  chainIdError,
  connectError,
  listKeysError,
  noWalletError,
  sendTransactionError,
} from '../errors';
import { type Transaction } from '../transaction-types';
import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
  type VegaWalletEvent,
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
    selectedAddress: string | null;
    // eslint-disable-next-line
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string) => void;
  };

  interface Window {
    // @ts-ignore must have identical modifiers
    ethereum: WindowEthereumProvider;
  }
}

export class SnapConnector implements Connector {
  readonly id = 'snap';
  readonly name = 'MetaMask Snap';
  readonly description =
    'Connect directly via MetaMask with the Vega Snap for single key support without advanced features.';

  node: string;
  version: string;
  snapId: string;
  ee: EventEmitter;

  // Note: apps may not know which node is selected on start up so its up
  // to the app to make sure class intances are renewed if the node changes
  constructor(config: SnapConfig) {
    this.node = config.node;
    this.version = config.version;
    this.snapId = config.snapId;
    this.ee = new EventEmitter();
  }

  bindStore() {}

  async connectWallet(desiredChainId: string) {
    try {
      await this.requestSnap();

      const { chainId } = await this.getChainId();

      if (chainId !== desiredChainId) {
        throw connectError(
          `desired chain is ${desiredChainId} but wallet chain is ${chainId}`
        );
      }

      this.bindListeners();
      return { success: true };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw noWalletError();
    }
  }

  async disconnectWallet() {
    this.unbindListeners();
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const res = await this.invokeSnap<{ chainID: string }>(
        JsonRpcMethod.GetChainId,
        {
          networkEndpoints: [this.node],
        }
      );
      return { chainId: res.chainID };
    } catch (err) {
      this.unbindListeners();
      throw chainIdError();
    }
  }

  async listKeys() {
    try {
      const res = await this.invokeSnap<{
        keys: Array<{ publicKey: string; name: string }>;
      }>(JsonRpcMethod.ListKeys);
      return res.keys;
    } catch (err) {
      this.unbindListeners();
      throw listKeysError();
    }
  }

  async isConnected() {
    try {
      // If this throws its likely the snap is disabled or has been uninstalled
      await this.listKeys();
      return { connected: true };
    } catch (err) {
      this.unbindListeners();
      return { connected: false };
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const res = await this.invokeSnap<{
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

      return {
        transactionHash: res.transactionHash,
        signature: res.transaction.signature.value,
        receivedAt: res.receivedAt,
        sentAt: res.sentAt,
      };
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }

      throw sendTransactionError();
    }
  }

  on(event: VegaWalletEvent, callback: () => void) {
    this.ee.on(event, callback);
  }

  off(event: VegaWalletEvent, callback?: () => void) {
    this.ee.off(event, callback);
  }
  ////////////////////////////////////
  // Snap methods
  ////////////////////////////////////

  /**
   * Emit wallet listeners for listeners invovoked by MetaMask
   */
  private bindListeners() {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (!accounts.length) {
        this.ee.emit('client.disconnected');
      }
    });
  }

  private unbindListeners() {
    window.ethereum.off('accountsChanged');
  }

  /**
   * Requests permission for a website to communicate with the specified snaps
   * and attempts to install them if they're not already installed.
   * If the installation of any snap fails, returns the error that caused the failure.
   * More informations here: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_requestsnaps
   */
  private async requestSnap() {
    await this.request(EthereumMethod.RequestSnaps, {
      [this.snapId]: {
        version: this.version,
      },
    });
  }

  // TODO: check if this is needed, its used in use-snap-status
  //
  //
  // /**
  //  * Gets the list of all installed snaps.
  //  * More information here: https://docs.metamask.io/snaps/reference/rpc-api/#wallet_getsnaps
  //  */
  // async getSnap() {
  //   const snaps = await this.request(EthereumMethod.GetSnaps);
  //   return Object.values(snaps).find(
  //     (s) => s.id === this.snapId && s.version === this.version
  //   );
  // }

  /**
   * Calls a method on the specified snap, always vega in this case
   * should always be npm:@vegaprotocol/snap
   */
  private async invokeSnap<TResult>(
    method: JsonRpcMethod,
    params?: SnapInvocationParams
  ): Promise<TResult> {
    return await this.request(EthereumMethod.InvokeSnap, {
      snapId: this.snapId,
      request: {
        method,
        params,
      },
    });
  }

  /**
   * Calls window.ethereum.request with method and params
   */
  private async request<TResult>(
    method: EthereumMethod,
    params?: object
  ): Promise<TResult> {
    if (window.ethereum?.request && window.ethereum?.isMetaMask) {
      // MetaMask in Firefox doesn't like undefined properties or some properties
      // on __proto__ so we need to strip them out with JSON.strinfify
      try {
        params = JSON.parse(JSON.stringify(params));
      } catch (err) {
        throw sendTransactionError();
      }

      return window.ethereum.request({
        method,
        params,
      });
    }

    throw noWalletError();
  }
}
