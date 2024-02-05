import { InjectedConnector } from './injected-connector';
import { JsonRpcConnector } from './json-rpc-connector';
import { SnapConnector } from './snap-connector';

export class Wallet {
  connector?: InjectedConnector | JsonRpcConnector | SnapConnector;

  async connectWallet(
    connector: InjectedConnector | JsonRpcConnector | SnapConnector
  ) {
    this.connector = connector;

    const res = await this.connector.connectWallet();

    if (res.success !== true) {
      // TODO: something better
      return;
    }

    const keys = await this.connector.listKeys();
    console.log(keys);
    return keys;
  }

  async disconnectWallet() {
    if (!this.connector) {
      throw new Error('no connector');
    }

    await this.connector.disconnectWallet();
    this.connector = undefined;
  }

  async listKeys() {
    if (!this.connector) {
      throw new Error('no connector');
    }

    return this.connector.listKeys();
  }

  async getChainId() {
    if (!this.connector) {
      throw new Error('no connector');
    }

    return this.connector.getChainId();
  }

  async isConnected() {
    if (!this.connector) {
      throw new Error('no connector');
    }

    return this.connector.isConnected();
  }

  // sendTransaction(...args: Parameters<typeof window.vega.sendTransaction>) {
  //   if (!this.connector) {
  //     throw new Error('no connector');
  //   }
  //
  //   return this.connector.sendTransaction(...args);
  // }
}
