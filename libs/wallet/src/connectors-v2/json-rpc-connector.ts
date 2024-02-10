import {
  JsonRpcMethod,
  type Connector,
  type TransactionParams,
} from '../types';

type JsonRpcConnectorConfig = { url: string };

export class JsonRpcConnector implements Connector {
  id = 'json-rpc';
  config: JsonRpcConnectorConfig;
  requestId: number = 0;
  token: string | null = null;

  constructor(config: JsonRpcConnectorConfig) {
    this.config = config;
  }

  async connectWallet(desiredChainId: string) {
    try {
      const { chainId } = await this.getChainId();

      if (chainId !== desiredChainId) {
        throw new Error('incorrect chain id');
      }

      const { response } = await this.request(JsonRpcMethod.ConnectWallet, {
        hostname: window.location.hostname,
      });

      const token = response.headers.get('Authorization');

      if (response.ok && token) {
        this.token = token;
        return { success: true };
      }

      return { error: 'failed to connect' };
    } catch (err) {
      return { error: 'failed to connect' };
    }
  }

  async disconnectWallet() {
    try {
      await this.request(JsonRpcMethod.DisconnectWallet);
      return { success: true };
    } catch (err) {
      return { error: 'failed to disconnect' };
    }
  }

  // deprecated, pass chain on connect
  async getChainId() {
    try {
      const { data } = await this.request(JsonRpcMethod.GetChainId);
      return { chainId: data.result.chainID };
    } catch (err) {
      return { error: 'failed to get chain id' };
    }
  }

  async listKeys() {
    try {
      const { data } = await this.request(JsonRpcMethod.ListKeys);
      return data.result.keys as Array<{ publicKey: string; name: string }>;
    } catch (err) {
      return { error: 'failed to list keys' };
    }
  }

  async isConnected() {
    try {
      await this.listKeys();
      return { connected: true };
    } catch (err) {
      return { error: 'failed to check isConnected' };
    }
  }

  async sendTransaction(params: TransactionParams) {
    try {
      const { data } = await this.request(
        JsonRpcMethod.SendTransaction,
        params
      );

      return {
        transactionHash: data.result.transactionHash,
        signature: data.result.transaction.signature.value,
        receivedAt: data.result.receivedAt,
        sentAt: data.result.sentAt,
      };
    } catch (err) {
      return { error: 'failed to send transaction' };
    }
  }

  private async request(method: JsonRpcMethod, params?: any) {
    const headers = new Headers();

    if (this.token) {
      headers.set('Authorization', this.token);
    }

    const response = await fetch(this.config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: `${this.requestId++}`,
        jsonrpc: '2.0',
        method,
        params,
      }),
    });
    const data = await response.json();
    return {
      data,
      response,
    };
  }

  on() {
    console.warn('events are not supported in json rpc wallet');
  }

  off() {
    console.warn('events are not supported in json rpc wallet');
  }
}
