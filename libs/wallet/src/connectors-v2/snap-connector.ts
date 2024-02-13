import { clearConfig, setConfig } from '../storage';
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

export class SnapConnector implements Connector {
  readonly id = 'snap';

  node: string;
  version: string;
  snapId: string;

  constructor(config: SnapConfig) {
    this.node = config.node;
    this.version = config.version;
    this.snapId = config.snapId;
  }

  async connectWallet(desiredChainId: string) {
    try {
      await this.requestSnap();

      const { chainId } = await this.getChainId();

      if (chainId !== desiredChainId) {
        throw new Error('incorrect chain id');
      }

      setConfig({ type: this.id, chainId });
      return { success: true };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'failed to connect',
      };
    }
  }

  async disconnectWallet() {
    clearConfig();
    return { success: true };
    // return { error: 'failed to disconnect' };
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const res = await this.invokeSnap(JsonRpcMethod.GetChainId, {
        networkEndpoints: [this.node],
      });
      return { chainId: res.chainID };
    } catch (err) {
      return { error: 'failed to get chain id' };
    }
  }

  async listKeys() {
    try {
      const res = await this.invokeSnap(JsonRpcMethod.ListKeys);
      return res.keys as Array<{ publicKey: string; name: string }>;
    } catch (err) {
      return { error: 'failed to list keys' };
    }
  }

  async isConnected() {
    console.warn('isConnected not implemented');
    return { error: 'failed to check if connected' };
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const res = await this.invokeSnap(JsonRpcMethod.SendTransaction, {
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
      console.error(err);
      return { error: 'failed to send transaction' };
    }
  }

  on() {
    console.warn('events are not supported in json rpc wallet');
  }

  off() {
    console.warn('events are not supported in json rpc wallet');
  }

  ////////////////////////////////////
  // Snap methods
  ////////////////////////////////////

  async requestSnap() {
    const res = await this.request(EthereumMethod.RequestSnaps, {
      [this.snapId]: {
        version: this.version,
      },
    });
    console.log(res);
  }

  async getSnap() {
    const snaps = await this.request(EthereumMethod.GetSnaps);
    return Object.values(snaps).find(
      (s) => s.id === this.snapId && s.version === this.version
    );
  }

  async invokeSnap(method: JsonRpcMethod, params?: any) {
    return await this.request(EthereumMethod.InvokeSnap, {
      snapId: this.snapId,
      request: {
        method: method,
        params,
      },
    });
  }

  async request(method: EthereumMethod, params?: any) {
    if (!window.ethereum) {
      throw new Error('no window.ethereum');
    }

    // @ts-ignore ethereum types a bit mangled from web3-react
    return window.ethereum.request({
      method,
      params,
    });
  }
}
