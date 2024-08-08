import { createWindow } from '../src/windows.js';
import config from '!/config';

export const createConnectionHandler =
  (clientPorts, popupPorts, interactor) => async (port) => {
    if (port.name === 'content-script') return clientPorts.listen(port);
    if (port.name === 'popup') {
      popupPorts.listen(port);
      interactor.connect(port);
    }
  };

export const createOnInstalledListener =
  (networks, settings, connections, keySortIndex, wallets) =>
  async (details) => {
    const { reason } = details;
    if (reason === 'install') {
      await install({ networks, settings });

      if (config.autoOpenOnInstall) {
        createWindow();
      }
    }

    if (reason === 'update') {
      await update({ settings, networks, connections, keySortIndex, wallets });
    }
  };

export async function install({ networks, settings }) {
  await Promise.allSettled([
    ...config.networks.map((network) => networks.set(network.id, network)),
    settings.set('selectedNetwork', config.defaultNetworkId),
    settings.set('autoOpen', true),
    settings.set('showHiddenNetworks', false),
    settings.set('version', migrations.length),
  ]);
}

export const migrations = [
  // The first migration is due to the introduction of autoOpen in 0.11.0,
  // however, we failed to test updates in CI.
  async function v1({ settings }) {
    await settings.transaction(async (store) => {
      if ((await store.get('autoOpen')) == null)
        await store.set('autoOpen', true);

      await store.set('version', 1);
    });
  },

  // The second migration is modifying the network structure,
  // introducing a fixed chainId, and tying a connection to a specific
  // chainId (with a preferred networkId).
  async function v2({ settings, networks, connections }) {
    await settings.transaction(async (store) => {
      const defaultNetworkId = config.defaultNetworkId;
      const defaultChainId = config.defaultChainId;

      await store.set('selectedNetwork', defaultNetworkId);

      // populate all networks
      await networks.store.clear();
      for (const network of config.networks) {
        await networks.set(network.id, network);
      }

      // update all connections to have default values for chainId and networkId
      for (const [origin, connection] of await connections.store.entries()) {
        connection.chainId = defaultChainId;
        connection.networkId = defaultNetworkId;

        await connections.store.set(origin, connection);
      }

      await store.set('version', 2);
    });
  },

  // The third migration is modifying the network structure,
  // adding a color to it
  async function v3({ settings, networks }) {
    await settings.transaction(async (store) => {
      // repopulate all networks
      await networks.store.clear();
      for (const network of config.networks) {
        await networks.set(network.id, network);
      }
      await store.set('version', 3);
    });
  },

  // Fourth migration is adding a keySortIndex to the wallet
  // populate this with the existing keys
  async function v4({ settings, keySortIndex, wallets }) {
    // TODO the wallets is not gaurenteed to be unlocked. This has been around for a couple of months though with no reports... so maybe it doesn't matter?
    try {
      await settings.transaction(async (store) => {
        const wals = await wallets.list();
        // There is only one wallet at this point
        const keys = await wallets.listKeys({ wallet: wals[0] });
        let i = 0;
        for (const key of keys) {
          await keySortIndex.set(key.publicKey, i);
          i++;
        }
        await store.set('version', 4);
      });
    } catch (e) {
      console.error('Error migrating keySortIndex', e);
    }
  },

  // Migration to ensure that all connections now have autoConsent set
  async function v5({ settings, connections }) {
    await settings.transaction(async (store) => {
      // update all connections to have default values for chainId and networkId
      for (const [origin, connection] of await connections.store.entries()) {
        connection.autoConsent = false;

        await connections.store.set(origin, connection);
      }

      await store.set('version', 5);
      await store.set('showHiddenNetworks', false);
    });
  },

  // The sixth migration is modifying the network structure,
  // introducing arbitrum URLS and chainIds for both Eth and Arb
  // Easiest thing to do is nuke the networks and repopulate them
  async function v6({ settings, networks }) {
    await settings.transaction(async (store) => {
      // populate all networks
      await networks.store.clear();
      for (const network of config.networks) {
        await networks.set(network.id, network);
      }

      await store.set('version', 6);
    });
  },
];

// Migration function, add more dependencies as needed for migrations
export async function update(stores) {
  const previousVersion = (await stores.settings.get('version')) ?? 0;
  for (let i = previousVersion; i < migrations.length; i++) {
    await migrations[i](stores);
  }
}

export const setupListeners = (
  runtime,
  networks,
  settings,
  clientPorts,
  popupPorts,
  interactor,
  connections,
  keySortIndex,
  wallets
) => {
  const installListener = createOnInstalledListener(
    networks,
    settings,
    connections,
    keySortIndex,
    wallets
  );
  runtime.onInstalled.addListener(installListener);

  const connectionListener = createConnectionHandler(
    clientPorts,
    popupPorts,
    interactor
  );
  runtime.onConnect.addListener(connectionListener);
};
