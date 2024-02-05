import { TransactionParams, type Connector } from '.';

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
      console.error(err);
      return { error: 'failed to send transaction' };
    }
  }

  on(event: 'client.disconnected', callback: () => void) {
    window.vega.on(event, callback);
  }

  off(event: 'client.disconnected') {
    window.vega.off(event);
  }
}
