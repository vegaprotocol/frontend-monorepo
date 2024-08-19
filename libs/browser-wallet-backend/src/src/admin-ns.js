import { JSONRPCServer } from '@vegaprotocol/json-rpc';
import * as adminValidation from '../validation/admin/index.js';
import pkg from '../../package.json';
import { toBase64, string as fromString } from '@vegaprotocol/crypto/buf';
import * as txHelpers from './tx-helpers.js';

function doValidate(validator, params) {
  if (!validator(params)) {
    throw new JSONRPCServer.Error(
      validator.errors[0].message,
      1,
      validator.errors.map((e) => e.message)
    );
  }
}

const Errors = {
  UNKNOWN_PUBLIC_KEY: [
    'Unknown public key',
    -1,
    'The public key is not known to the wallet',
  ],
};

/**
 * Initialise the admin namespace server. The stores passed should be low-level Map-like
 * storage, as the internals of the implementation will wrap these to do encryption and
 * prevent data-races
 *
 * @param {Store} settings Map-like implementation to store settings.
 * @param {WalletCollection} wallets
 * @param {NetworkCollection} networks
 * @param {ConnectionCollection} connections
 * @param {FetchCache} fetchCache
 * @param {Function} onerror Error handler
 * @returns {JSONRPCServer}
 */
export default function init({
  encryptedStore,
  settings,
  wallets,
  networks,
  connections,
  fetchCache,
  transactions,
  publicKeyIndexStore,
  onerror,
}) {
  connections.on('set', (connection) => {
    server.notify('admin.connections_change', {
      add: [connection],
      update: [],
      delete: [],
    });
  });

  connections.on('delete', (connection) => {
    server.notify('admin.connections_change', {
      add: [],
      update: [],
      delete: [connection],
    });
  });

  var server = new JSONRPCServer({
    onerror,
    methods: {
      async 'admin.app_globals'(params) {
        doValidate(adminValidation.appGlobals, params);

        const hasPassphrase = await encryptedStore.exists();
        const isLocked = encryptedStore.locked === true;

        // TODO this is kinda indeterminate, as we don't know if the storage is empty
        const hasWallet = isLocked
          ? false
          : Array.from(await wallets.list()).length > 0;
        return {
          passphrase: hasPassphrase,
          wallet: hasWallet,
          // We don't consider the app locked if there is no passphrase
          locked: hasPassphrase && isLocked,
          version: pkg.version,

          settings: Object.fromEntries(await settings.entries()),
        };
      },

      async 'admin.update_app_settings'(params) {
        doValidate(adminValidation.updateAppSettings, params);
        await settings.transaction(async (store) => {
          for (const [key, value] of Object.entries(params)) {
            await store.set(key, value);
          }
        });

        return null;
      },

      async 'admin.create_passphrase'(params) {
        doValidate(adminValidation.createPassphrase, params);

        await encryptedStore.create(params.passphrase);

        return null;
      },

      async 'admin.unlock'(params) {
        doValidate(adminValidation.unlock, params);
        if ((await encryptedStore.exists()) === false)
          throw new JSONRPCServer.Error('Encryption not initialised', 1);
        try {
          await encryptedStore.unlock(params.passphrase);
        } catch (e) {
          if (e.message === 'Invalid passphrase or corrupted storage') {
            throw new JSONRPCServer.Error(
              'Invalid passphrase or corrupted storage',
              1
            );
          }
          throw e;
        }

        return null;
      },

      async 'admin.lock'(params) {
        doValidate(adminValidation.lock, params);
        await encryptedStore.lock();

        return null;
      },

      async 'admin.list_networks'(params) {
        doValidate(adminValidation.listNetworks, params);
        const nets = await networks.listNetworkDetails();
        return { networks: nets };
      },

      async 'admin.generate_recovery_phrase'(params) {
        doValidate(adminValidation.generateRecoveryPhrase, params);

        return { recoveryPhrase: await wallets.generateRecoveryPhrase() };
      },

      async 'admin.delete_wallet'(params) {
        doValidate(adminValidation.deleteWallet, params);

        try {
          await wallets.store.delete(params.name);
          await transactions.transactionStore.delete(params.name);
          await connections.clearConnections();
          await publicKeyIndexStore.clear();
        } catch (ex) {
          throw new JSONRPCServer.Error(ex.message, 1);
        }

        return null;
      },

      async 'admin.import_wallet'(params) {
        doValidate(adminValidation.importWallet, params);

        try {
          await wallets.import(params);
        } catch (e) {
          throw new JSONRPCServer.Error(e.message, 1);
        }

        return null;
      },

      async 'admin.create_derived_mnemonic'(params) {
        return await wallets.generateDerivedMnemonic({
          hexStr: params.signedData,
          salt: 'hedgehog',
        });
      },

      async 'admin.list_wallets'(params) {
        doValidate(adminValidation.listWallets, params);

        return { wallets: await wallets.list() };
      },

      async 'admin.list_keys'(params) {
        doValidate(adminValidation.listKeys, params);

        return { keys: Array.from(await wallets.listKeys(params)) };
      },

      async 'admin.generate_key'(params) {
        doValidate(adminValidation.generateKey, params);

        return await wallets.generateKey(params);
      },

      async 'admin.export_key'(params) {
        doValidate(adminValidation.exportKey, params);

        if ((await encryptedStore.verifyPassphrase(params.passphrase)) !== true)
          throw new JSONRPCServer.Error(
            'Invalid passphrase or corrupted storage',
            1
          );

        try {
          return await wallets.exportKey({ publicKey: params.publicKey });
        } catch (ex) {
          throw new JSONRPCServer.Error(ex.message, 1);
        }
      },

      async 'admin.export_recovery_phrase'(params) {
        doValidate(adminValidation.exportRecoveryPhrase, params);
        if ((await encryptedStore.verifyPassphrase(params.passphrase)) !== true)
          throw new JSONRPCServer.Error(
            'Invalid passphrase or corrupted storage',
            1
          );
        try {
          return await wallets.exportRecoveryPhrase({
            walletName: params.walletName,
          });
        } catch (ex) {
          throw new JSONRPCServer.Error(ex.message, 1);
        }
      },

      async 'admin.rename_key'(params) {
        doValidate(adminValidation.renameKey, params);

        try {
          return await wallets.renameKey(params);
        } catch (ex) {
          throw new JSONRPCServer.Error(ex.message, 1);
        }
      },

      async 'admin.sign_message'(params) {
        doValidate(adminValidation.signMessage, params);

        const key = await wallets.getKeypair({ publicKey: params.publicKey });
        if (key == null) throw new JSONRPCServer.Error('Key not found', 1);

        const { keyPair } = key;

        const signature = await keyPair.sign(fromString(params.message), null); // no chainId

        return { signature: toBase64(signature) };
      },

      async 'admin.list_connections'(params) {
        doValidate(adminValidation.listConnections, params);

        return { connections: await connections.list() };
      },

      async 'admin.remove_connection'(params) {
        doValidate(adminValidation.removeConnection, params);

        await connections.delete(params.origin);

        return null;
      },

      async 'admin.update_automatic_consent'(params) {
        doValidate(adminValidation.updateConnection, params);

        await connections.update(params.origin, {
          autoConsent: params.autoConsent,
        });

        return null;
      },

      async 'admin.fetch'(params) {
        doValidate(adminValidation.fetch, params);

        try {
          const network = await networks.getByNetworkId(params.networkId);
          const rpc = await network.rpc();

          const cached = await fetchCache.get(params.path, params.networkId);
          if (cached) return cached;

          const res = await rpc.getJSON(params.path);

          await fetchCache.set(params.path, params.networkId, res);

          return res;
        } catch (ex) {
          throw new JSONRPCServer.Error('Failed to fetch data', -1, ex.message);
        }
      },

      async 'admin.list_transactions'(params) {
        doValidate(adminValidation.listTransactions, params);
        return await transactions.listTxs(params.walletName);
      },

      async 'admin.check_transaction'(params) {
        doValidate(adminValidation.checkTransaction, params);

        const keyInfo = await wallets.getKeyInfo({
          publicKey: params.publicKey,
        });

        if (keyInfo == null)
          throw new JSONRPCServer.Error(...Errors.UNKNOWN_PUBLIC_KEY);
        const key = await wallets.getKeypair({ publicKey: params.publicKey });

        const selectedNetworkId = await connections.getNetworkId(params.origin);
        const selectedChainId = await connections.getChainId(params.origin);
        const network = await networks.get(selectedNetworkId, selectedChainId);

        const rpc = await network.rpc();

        const res = await txHelpers.checkTransaction({
          keys: key.keyPair,
          rpc,
          transaction: params.transaction,
        });

        return {
          valid: res.valid,
          error: res.error,
        };
      },
    },
  });

  return server;
}
