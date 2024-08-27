import { ConnectionsCollection } from '../src/connections.js';
import ConcurrentStorage from '../lib/concurrent-storage.js';

const createConnections = () => {
  const connectionsStore = new ConcurrentStorage(new Map());
  const publicKeyIndexStore = new ConcurrentStorage(new Map());
  const keySortIndex = new ConcurrentStorage(new Map());
  return {
    connectionsStore,
    publicKeyIndexStore,
    keySortIndex,
    connections: new ConnectionsCollection({
      connectionsStore,
      publicKeyIndexStore,
      keySortIndex,
    }),
  };
};

describe('ConnectionsCollection', () => {
  it('should be allowed on static key set', async () => {
    const { connections, publicKeyIndexStore } = createConnections();

    await publicKeyIndexStore.set('123', {
      publicKey: '123',
      wallet: 'w1',
      name: 'k1',
    });
    await publicKeyIndexStore.set('321', {
      publicKey: '321',
      wallet: 'w1',
      name: 'k2',
    });
    await publicKeyIndexStore.set('443', {
      publicKey: '443',
      wallet: 'w2',
      name: 'k3',
    });

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w2'],
        publicKeys: [],
      },
    });

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      false
    );
    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      false
    );
    expect(await connections.isAllowed('https://example.com', '443')).toBe(
      true
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '443', name: 'k3' },
    ]);

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
    });

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      true
    );
    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      true
    );
    expect(await connections.isAllowed('https://example.com', '443')).toBe(
      false
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '123', name: 'k1' },
      { publicKey: '321', name: 'k2' },
    ]);

    await connections.set('https://example.com', {
      allowList: {
        wallets: [],
        publicKeys: ['123', '443'],
      },
    });

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      true
    );
    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      false
    );
    expect(await connections.isAllowed('https://example.com', '443')).toBe(
      true
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '123', name: 'k1' },
      { publicKey: '443', name: 'k3' },
    ]);

    await connections.set('https://example.com', {
      allowList: {
        wallets: [],
        publicKeys: [],
      },
    });

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      false
    );
    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      false
    );
    expect(await connections.isAllowed('https://example.com', '443')).toBe(
      false
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual(
      []
    );

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w1', 'w2'],
        publicKeys: [],
      },
    });

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      true
    );
    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      true
    );
    expect(await connections.isAllowed('https://example.com', '443')).toBe(
      true
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '123', name: 'k1' },
      { publicKey: '321', name: 'k2' },
      { publicKey: '443', name: 'k3' },
    ]);
  });

  it('should be allowed on dynamic key set', async () => {
    const { connections, publicKeyIndexStore } = createConnections();

    await publicKeyIndexStore.set('123', {
      publicKey: '123',
      wallet: 'w1',
      name: 'k1',
    });

    await connections.set('https://example.com', {
      chainId: 'chainId',
      networkId: 'networkId',
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
    });

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      true
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '123', name: 'k1' },
    ]);

    await publicKeyIndexStore.set('321', {
      publicKey: '321',
      wallet: 'w1',
      name: 'k2',
    });

    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      true
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '123', name: 'k1' },
      { publicKey: '321', name: 'k2' },
    ]);

    await publicKeyIndexStore.delete('123');

    expect(await connections.isAllowed('https://example.com', '123')).toBe(
      false
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '321', name: 'k2' },
    ]);

    await publicKeyIndexStore.delete('321');

    expect(await connections.isAllowed('https://example.com', '321')).toBe(
      false
    );
    expect(await connections.listAllowedKeys('https://example.com')).toEqual(
      []
    );
  });

  it('should order keys in order as set by index', async () => {
    const { connections, publicKeyIndexStore, keySortIndex } =
      createConnections();

    await publicKeyIndexStore.set('123', {
      publicKey: '123',
      wallet: 'w1',
      name: 'k1',
    });
    await publicKeyIndexStore.set('321', {
      publicKey: '321',
      wallet: 'w1',
      name: 'k2',
    });
    await publicKeyIndexStore.set('443', {
      publicKey: '443',
      wallet: 'w1',
      name: 'k3',
    });
    await keySortIndex.set('123', 0);
    await keySortIndex.set('321', 2);
    await keySortIndex.set('443', 1);

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
    });

    expect(await connections.listAllowedKeys('https://example.com')).toEqual([
      { publicKey: '123', name: 'k1', order: 0 },
      { publicKey: '443', name: 'k3', order: 1 },
      { publicKey: '321', name: 'k2', order: 2 },
    ]);
  });

  it('should emit events set/delete', async () => {
    jest.useFakeTimers().setSystemTime(0);

    const { connections, publicKeyIndexStore } = createConnections();

    const deleteListener = jest.fn();
    const setListener = jest.fn();
    connections.on('set', setListener);
    connections.on('delete', deleteListener);

    await publicKeyIndexStore.set('123', {
      publicKey: '123',
      wallet: 'w1',
      name: 'k1',
    });

    await connections.set('https://example.com', {
      origin: 'https://example.com',
      networkId: null,
      chainId: null,
      allowList: { wallets: ['w1'], publicKeys: [] },
      accessedAt: 0,
      autoConsent: false,
    });

    expect(setListener).toHaveBeenCalledWith({
      origin: 'https://example.com',
      networkId: null,
      chainId: null,
      allowList: { wallets: ['w1'], publicKeys: [] },
      accessedAt: 0,
      autoConsent: false,
    });

    expect(await connections.list()).toEqual([
      {
        origin: 'https://example.com',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 0,
        networkId: null,
        chainId: null,
        autoConsent: false,
      },
    ]);

    await connections.delete('https://example.com');
    expect(deleteListener).toHaveBeenCalledWith({
      origin: 'https://example.com',
    });

    expect(await connections.list()).toEqual([]);

    jest.useRealTimers();
  });

  it('should emit events disconnect', async () => {
    const { connections } = createConnections();

    const listener = jest.fn();
    connections.on('delete', listener);

    await connections.delete('*');
    expect(listener).toHaveBeenCalledWith({ origin: '*' });

    await connections.delete('https://example.com');
    expect(listener).toHaveBeenCalledWith({ origin: 'https://example.com' });
  });

  it('should order origins by last accessed', async () => {
    jest.useFakeTimers().setSystemTime(0);

    const { connections, publicKeyIndexStore } = createConnections();

    await publicKeyIndexStore.set('123', {
      publicKey: '123',
      wallet: 'w1',
      name: 'k1',
    });

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
    });

    jest.setSystemTime(1000);

    await connections.set('https://example.org', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
    });

    jest.setSystemTime(2000);

    await connections.set('https://example.net', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
    });

    expect(await connections.list()).toEqual([
      {
        origin: 'https://example.net',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 2000,
        chainId: null,
        networkId: null,
        autoConsent: false,
      },
      {
        origin: 'https://example.org',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 1000,
        chainId: null,
        networkId: null,
        autoConsent: false,
      },
      {
        origin: 'https://example.com',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 0,
        chainId: null,
        networkId: null,
        autoConsent: false,
      },
    ]);

    jest.setSystemTime(3000);

    await connections.touch('https://example.org');

    expect(await connections.list()).toEqual([
      {
        chainId: null,
        networkId: null,
        origin: 'https://example.org',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 3000,
        autoConsent: false,
      },
      {
        chainId: null,
        networkId: null,
        origin: 'https://example.net',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 2000,
        autoConsent: false,
      },
      {
        chainId: null,
        networkId: null,
        origin: 'https://example.com',
        allowList: { wallets: ['w1'], publicKeys: [] },
        accessedAt: 0,
        autoConsent: false,
      },
    ]);

    jest.useRealTimers();
  });

  it('should get the chainId of an origin', async () => {
    const { connections } = createConnections();

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
      chainId: 'chainId',
    });

    expect(await connections.getChainId('https://example.com')).toBe('chainId');
    expect(await connections.getChainId('foo')).toBe(null);
  });
  it('should clear connections, index and emit events', async () => {
    const { connections } = createConnections();

    const deleteListener = jest.fn();
    connections.on('delete', deleteListener);

    await connections.set('https://example.com', {
      allowList: {
        wallets: ['w1'],
        publicKeys: [],
      },
      networkId: 'networkId',
    });

    await connections.clearConnections();

    expect(deleteListener).toHaveBeenCalledWith({
      origin: 'https://example.com',
    });
    expect(Array.from(await connections.store.values()).length).toBe(0);
    expect(Array.from(await connections.index.values()).length).toBe(0);
  });
});
