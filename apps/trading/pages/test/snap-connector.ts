import { JsonRpcMethod } from '.';

enum EthereumMethod {
  RequestSnaps = 'wallet_requestSnaps',
  GetSnaps = 'wallet_getSnaps',
  InvokeSnap = 'wallet_invokeSnap',
}

type SnapConfig = {
  id: string;
  node: string;
  version: string;
};

export class SnapConnector implements Connector {
  id = 'snap';

  config: SnapConfig;

  constructor(config: SnapConfig) {
    this.config = config;
  }

  async connectWallet(desiredChainId: string) {
    try {
      await this.requestSnap();

      const { chainId } = await this.getChainId();
      console.log(chainId);

      if (chainId !== desiredChainId) {
        throw new Error('incorrect chain id');
      }

      return { success: true };
    } catch (err) {
      return { error: 'failed to connect' };
    }
  }

  async disconnectWallet() {
    console.warn('disconnectWallet not implemented');
    return { error: 'failed to disconnect' };
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const res = await this.invokeSnap(JsonRpcMethod.GetChainId, {
        networkEndpoints: [this.config.node],
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

  async requestSnap() {
    const res = await this.request(EthereumMethod.RequestSnaps, {
      [this.config.id]: {
        version: this.config.version,
      },
    });
    console.log(res);
  }

  async getSnap() {
    const snaps = await this.request(EthereumMethod.GetSnaps);
    return Object.values(snaps).find(
      (s) => s.id === this.config.id && s.version === this.config.version
    );
  }

  async invokeSnap(method: JsonRpcMethod, params?: any) {
    return await this.request(EthereumMethod.InvokeSnap, {
      snapId: this.config.id,
      request: {
        method: method,
        params,
      },
    });
  }

  // async sendTransaction(
  //   ...args: Parameters<typeof window.vega.sendTransaction>
  // ) {
  //   try {
  //     const res = await window.vega.sendTransaction(...args);
  //   } catch (err) {
  //   }
  // }

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

  on() {
    console.warn('events are not supported in json rpc wallet');
  }

  off() {
    console.warn('events are not supported in json rpc wallet');
  }
}
