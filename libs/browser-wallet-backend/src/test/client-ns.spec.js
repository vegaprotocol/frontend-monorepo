import initClientServer from '../src/client-ns.js';
import { WalletCollection } from '../src/wallets.js';
import { Network, NetworkCollection } from '../src/network.js';
import { ConnectionsCollection } from '../src/connections.js';
import ConcurrentStorage from '../lib/concurrent-storage.js';
import EncryptedStorage from '../lib/encrypted-storage.js';
import { testingNetwork } from '../../config/well-known-networks.js';

describe('client-ns', () => {
  it('should connect, then disconnect', async () => {
    const publicKeyIndexStore = new ConcurrentStorage(new Map());
    const connections = new ConnectionsCollection({
      connectionsStore: new ConcurrentStorage(new Map()),
      publicKeyIndexStore,
    });

    const interactor = {
      reviewConnection() {
        return true;
      },
      reviewTransaction() {
        return true;
      },
    };

    const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
    await enc.create();
    const keySortIndex = new ConcurrentStorage(new Map());

    const server = initClientServer({
      settings: new ConcurrentStorage(
        new Map([['selectedNetwork', testingNetwork.id]])
      ),
      wallets: new WalletCollection({
        walletsStore: enc,
        publicKeyIndexStore,
        keySortIndex,
      }),
      networks: new NetworkCollection(
        new Map([[testingNetwork.id, new Network(testingNetwork)]])
      ),
      connections,
      interactor,
      onerror(err) {
        throw err;
      },
    });

    const context = {
      origin: 'https://example.com',
    };

    const res = await server.onrequest(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'client.connect_wallet',
        params: {
          chainId: testingNetwork.chainId,
        },
      },
      context
    );

    expect(res).toMatchObject({
      jsonrpc: '2.0',
      id: 1,
    });
    expect(context.isConnected).toBe(true);
    expect(await connections.has(context.origin)).toBe(true);

    const res2 = await server.onrequest(
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'client.disconnect_wallet',
        params: null,
      },
      context
    );

    expect(res2).toMatchObject({
      jsonrpc: '2.0',
      id: 2,
      result: null,
    });
    expect(await connections.has(context.origin)).toBe(true);
  });

  it('reconnect should update access time', async () => {
    jest.useFakeTimers().setSystemTime(0);

    const publicKeyIndexStore = new ConcurrentStorage(new Map());
    const connections = new ConnectionsCollection({
      connectionsStore: new ConcurrentStorage(new Map()),
      publicKeyIndexStore,
    });

    const interactor = {
      reviewConnection() {
        return true;
      },
    };

    const enc = new EncryptedStorage(new Map(), { memory: 10, iterations: 1 });
    await enc.create();
    const keySortIndex = new ConcurrentStorage(new Map());

    const server = initClientServer({
      settings: new ConcurrentStorage(
        new Map([['selectedNetwork', testingNetwork.id]])
      ),
      wallets: new WalletCollection({
        walletsStore: enc,
        publicKeyIndexStore,
        keySortIndex,
      }),
      networks: new NetworkCollection(
        new Map([[testingNetwork.id, new Network(testingNetwork)]])
      ),
      connections,
      interactor,
      onerror(err) {
        throw err;
      },
    });

    const connectReq = {
      jsonrpc: '2.0',
      method: 'client.connect_wallet',
      params: { chainId: testingNetwork.chainId },
    };
    const nullRes = { jsonrpc: '2.0' };

    const context = {
      origin: 'https://example.com',
    };

    const res = await server.onrequest(
      {
        ...connectReq,
        id: 1,
      },
      context
    );

    expect(res).toMatchObject({
      ...nullRes,
      id: 1,
    });

    jest.advanceTimersByTime(1000);

    expect(await connections.list()).toMatchObject([
      {
        origin: 'https://example.com',
        accessedAt: 0,
      },
    ]);

    const res3 = await server.onrequest(
      {
        ...connectReq,
        id: 3,
      },
      context
    );

    expect(res3).toMatchObject({
      ...nullRes,
      id: 3,
    });
    await connections.touch(context.origin);

    expect(await connections.list()).toMatchObject([
      {
        origin: 'https://example.com',
        accessedAt: 1000,
      },
    ]);

    jest.useRealTimers();
  });
});
