import { type Connector } from '../types';

export const mockKeys = [
  {
    name: 'Key 1',
    publicKey: '1'.repeat(64),
  },
  {
    name: 'Key 2',
    publicKey: '2'.repeat(64),
  },
];

export class MockConnector implements Connector {
  readonly id = 'mock';
  readonly name = 'Mock';
  readonly description = 'Connector for test purposes';

  constructor() {}

  bindStore() {}

  async connectWallet() {
    return { success: true };
  }

  async disconnectWallet() {
    return { success: true };
  }

  async getChainId() {
    return {
      chainId: mockChain.id,
    };
  }

  async listKeys() {
    return mockKeys;
  }

  async isConnected() {
    return { connected: true };
  }

  // @ts-ignore deliberate fail bb
  async sendTransaction() {
    return {
      transactionHash: '0x' + 'a'.repeat(64),
      signature: '0x' + 'a'.repeat(64),
      sentAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };
  }

  on() {}

  off() {}
}
