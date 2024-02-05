import { type Connector } from '.';

export class InjectedConnector implements Connector {
  id = 'injected';

  async connectWallet(chainId: string) {
    try {
      await window.vega.connectWallet({ chainId });
      return { success: true };
    } catch (err) {
      return { error: 'failed to connect' };
    }
  }

  async disconnectWallet() {
    try {
      await window.vega.disconnectWallet();
      return { success: true };
    } catch (err) {
      return { error: 'failed to disconnect' };
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const res = await window.vega.getChainId();
      return { chainId: res.chainID };
    } catch (err) {
      return { error: 'failed to get chain id' };
    }
  }

  async listKeys() {
    try {
      const res = await window.vega.listKeys();
      return res.keys;
    } catch (err) {
      return { error: 'failed to list keys' };
    }
  }

  async isConnected() {
    try {
      const res = await window.vega.isConnected();
      return { connected: res };
    } catch (err) {
      return { error: 'failed to check isConnected' };
    }
  }

  // async sendTransaction(
  //   ...args: Parameters<typeof window.vega.sendTransaction>
  // ) {
  //   try {
  //     const res = await window.vega.sendTransaction(...args);
  //   } catch (err) {
  //   }
  // }

  on(event: Parameters<typeof window.vega.on>[0], callback: () => void) {
    window.vega.on(event, callback);
  }

  off(event: Parameters<typeof window.vega.off>[0]) {
    window.vega.off(event);
  }
}
