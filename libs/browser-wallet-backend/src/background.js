import { WalletCollection } from './src/wallets.js';
import { TransactionsCollection } from './src/transactions.js';
import { ConnectionsCollection } from './src/connections.js';

import { PopupClient } from './src/popup-client.js';
import { setupListeners } from './lib/setup-listeners.js';

import { StorageLocalMap, StorageSessionMap } from './lib/storage.js';
import ConcurrentStorage from './lib/concurrent-storage.js';
import EncryptedStorage from './lib/encrypted-storage.js';
import { FetchCache } from './src/fetch-cache.js';
import { isIos } from './lib/utils.js';

import initAdmin from './src/admin-ns.js';
import initClient from './src/client-ns.js';

import { PortServer } from '@vegaprotocol/json-rpc';
import NodeRPC from './src/node-rpc.js';

export const createWalletBackend = ({ node }) => {
  const rpc = new NodeRPC(node);
  const interactor = new PopupClient({});

  const encryptedStore = new EncryptedStorage(
    new ConcurrentStorage(new StorageLocalMap('wallets')),
    undefined,
    isIos()
  );
  if (!encryptedStore.exists()) {
    // TODO: this is async and so could lead to weird race conditions if the user is fast enough. Unlikely.
    encryptedStore.create(Math.floor(Math.random() * 1000000 + 1).toString());
  }
  const publicKeyIndexStore = new ConcurrentStorage(
    new StorageLocalMap('public-key-index')
  );
  const keySortIndex = new ConcurrentStorage(
    new StorageLocalMap('key-sort-index')
  );

  const settings = new ConcurrentStorage(new StorageLocalMap('settings'));
  const wallets = new WalletCollection({
    walletsStore: encryptedStore,
    publicKeyIndexStore,
    keySortIndex,
  });
  const connections = new ConnectionsCollection({
    connectionsStore: new ConcurrentStorage(new StorageLocalMap('connections')),
    publicKeyIndexStore,
    keySortIndex,
  });

  const fetchCache = new FetchCache(new StorageSessionMap('fetch-cache'));
  const transactionsStore = new ConcurrentStorage(
    new StorageLocalMap('transactions')
  );
  const transactions = new TransactionsCollection({
    store: transactionsStore,
    connections,
  });

  const onerror = (...args) => {
    console.error(args);
  };

  const clientServer = initClient({
    settings,
    wallets,
    rpc,
    connections,
    interactor,
    encryptedStore,
    transactions,
    publicKeyIndexStore,
    onerror,
  });

  const clientPorts = new PortServer({
    onerror,
    onconnect: async (context) => {
      // Auto connect if origin is already approved (what we internally call connected)
      context.isConnected = await connections.has(context.origin);
      await connections.touch(context.origin);
    },
    server: clientServer,
  });

  const server = initAdmin({
    encryptedStore,
    settings,
    wallets,
    rpc,
    connections,
    fetchCache,
    transactions,
    publicKeyIndexStore,
    onerror,
  });

  const popupPorts = new PortServer({
    server,
    onerror,
  });

  wallets.on('create_key', async () => {
    const ports = clientPorts.ports.entries();
    for (const [port, context] of ports) {
      const allowedKeys = await connections.listAllowedKeys(context.origin);
      if (allowedKeys.length !== 0) {
        port.postMessage({
          jsonrpc: '2.0',
          method: 'client.keys_changed',
          params: {
            keys: allowedKeys,
          },
        });
      }
    }
  });

  wallets.on('rename_key', async () => {
    const ports = clientPorts.ports.entries();
    for (const [port, context] of ports) {
      const allowedKeys = await connections.listAllowedKeys(context.origin);
      if (allowedKeys.length !== 0) {
        port.postMessage({
          jsonrpc: '2.0',
          method: 'client.keys_changed',
          params: {
            keys: allowedKeys,
          },
        });
      }
    }
  });

  setupListeners(settings, clientPorts, popupPorts, interactor);
};
