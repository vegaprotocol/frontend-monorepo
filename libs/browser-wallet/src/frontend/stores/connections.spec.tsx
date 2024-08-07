import { RpcMethods } from '@/lib/client-rpc-methods';

import { useConnectionStore } from './connections';

const request = (method: string) => {
  if (method === RpcMethods.ListConnections) {
    return {
      connections: [
        {
          allowList: {
            publicKeys: [],
            wallets: ['Wallet 1'],
          },
          accessedAt: Date.now(),
          origin: 'https://vega.xyz',
          chainId: 'foo',
          networkId: 'bar',
        },
      ],
    };
  }
  return null;
};

const initialState = useConnectionStore.getState();

describe('Store', () => {
  beforeEach(() => {
    useConnectionStore.setState(initialState);
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('loads connections from backend', async () => {
    expect(useConnectionStore.getState().loading).toBe(true);
    expect(useConnectionStore.getState().connections).toStrictEqual([]);
    await useConnectionStore
      .getState()
      .loadConnections(request as unknown as any);
    expect(useConnectionStore.getState().loading).toBe(false);
    expect(useConnectionStore.getState().connections).toStrictEqual([
      {
        allowList: {
          publicKeys: [],
          wallets: ['Wallet 1'],
        },
        accessedAt: Date.now(),
        origin: 'https://vega.xyz',
        chainId: 'foo',
        networkId: 'bar',
      },
    ]);
  });
  it('adds connections from backend uniquely', () => {
    expect(useConnectionStore.getState().loading).toBe(true);
    expect(useConnectionStore.getState().connections).toStrictEqual([]);
    useConnectionStore.getState().addConnection({
      allowList: {
        publicKeys: [],
        wallets: ['Wallet 1'],
      },
      accessedAt: Date.now(),
      origin: 'https://vega.xyz',
      chainId: 'foo',
      networkId: 'bar',
      autoConsent: false,
    });
    expect(useConnectionStore.getState().connections).toStrictEqual([
      {
        allowList: {
          publicKeys: [],
          wallets: ['Wallet 1'],
        },
        accessedAt: Date.now(),
        origin: 'https://vega.xyz',
        chainId: 'foo',
        networkId: 'bar',
        autoConsent: false,
      },
    ]);
    useConnectionStore.getState().addConnection({
      allowList: {
        publicKeys: [],
        wallets: ['Wallet 1'],
      },
      accessedAt: Date.now(),
      origin: 'https://vega.xyz',
      chainId: 'foo',
      networkId: 'bar',
      autoConsent: false,
    });
    expect(useConnectionStore.getState().connections).toStrictEqual([
      {
        allowList: {
          publicKeys: [],
          wallets: ['Wallet 1'],
        },
        accessedAt: Date.now(),
        origin: 'https://vega.xyz',
        chainId: 'foo',
        networkId: 'bar',
        autoConsent: false,
      },
    ]);
  });
  it('removes connections from backend', async () => {
    const mockConnection = {
      allowList: {
        publicKeys: [],
        wallets: ['Wallet 1'],
      },
      accessedAt: Date.now(),
      origin: 'https://vega.xyz',
      chainId: 'foo',
      networkId: 'bar',
      autoConsent: false,
    };
    useConnectionStore.setState({
      connections: [mockConnection],
    });

    await useConnectionStore
      .getState()
      .removeConnection(request as unknown as any, mockConnection);
    expect(useConnectionStore.getState().connections).toStrictEqual([]);
  });
});
