import JSONRPCServer from '../lib/json-rpc-server.js';
import * as txHelpers from './tx-helpers.js';
import * as clientValidation from '../validation/client/index.js';
import NodeRPC from './node-rpc.js';
import { AUTO_CONSENT_TRANSACTION_TYPES } from '../../frontend/lib/constants.js';
// import { isIos } from '../lib/utils.js';

// const action = globalThis.browser?.browserAction ?? globalThis.chrome?.action;

const Errors = {
  NOT_CONNECTED: [
    'Not connected',
    -1,
    'You must connect to the wallet before further interaction',
  ],
  CONNECTION_DENIED: [
    'Connection denied',
    -2,
    'The user denied the connection request',
  ],

  UNKNOWN_PUBLIC_KEY: [
    'Unknown public key',
    -3,
    'The public key is not known to the wallet',
  ],
  TRANSACTION_DENIED: [
    'Transaction denied',
    -4,
    'The user denied the transaction request',
  ],

  TRANSACTION_FAILED: [
    'Transaction failed',
    -5 /* This is filled in by the error thrown */,
  ],

  MISMATCHING_CHAIN_ID: [
    'Mismatching chain ID',
    -6,
    'The chain ID does not match the connected chain ID, please remove the connection from the wallet and connect again',
  ],

  UNKNOWN_CHAIN_ID: [
    'Unknown chain ID',
    -7,
    'The chain ID is not known to the wallet, please review the chain ID and try again',
  ],
  DEVELOPMENT_CHAIN_ID: [
    'Development chain ID',
    -8,
    'The chain ID is known to the wallet, but this is a hidden chainId used for development. Please ensure you have enabled hidden networks in settings',
  ],
  TRANSACTION_VALIDATION_FAILED: [
    'Transaction validation failed',
    -9 /* This is filled in by the error thrown */,
  ],
  WALLET_LOCKED: [
    'The wallet is locked',
    -10,
    'The wallet is locked, some operations are not allowed',
  ],
};

function doValidate(validator, params) {
  if (!validator(params))
    throw new JSONRPCServer.Error(
      validator.errors[0].message,
      1,
      validator.errors.map((e) => e.message)
    );
}

export default function init({
  onerror,
  settings,
  wallets,
  networks,
  connections,
  interactor,
  transactions,
  encryptedStore,
}) {
  return new JSONRPCServer({
    onerror,
    methods: {
      async 'client.connect_wallet'(params, context) {
        const receivedAt = new Date().toISOString();
        doValidate(clientValidation.connectWallet, params);
        if (context.isConnected === true) {
          if (!params.chainId) return null;
          if (
            params.chainId &&
            params.chainId === (await connections.getChainId(context.origin))
          )
            return null;
        }
        if ((await connections.has(context.origin)) === false) {
          // If this is a connection request, without a chainId we look up the default one for the extension
          if (params.chainId == null) {
            const selectedNetworkId = await settings.get('selectedNetwork');
            params.chainId = (
              await networks.getByNetworkId(selectedNetworkId)
            ).chainId;
          }
          const network = await networks.getByChainId(params.chainId);
          if (network == null) {
            throw new JSONRPCServer.Error(...Errors.UNKNOWN_CHAIN_ID);
          }
          const hiddenNetworksEnabled = await settings.get(
            'showHiddenNetworks'
          );
          if (network.hidden && hiddenNetworksEnabled !== true) {
            throw new JSONRPCServer.Error(...Errors.DEVELOPMENT_CHAIN_ID);
          }
          // if (action.openPopup && isIos()) {
          //   action.openPopup();
          // }
          const reply = await interactor.reviewConnection({
            origin: context.origin,
            chainId: params.chainId,
            receivedAt,
          });
          if (reply.approved === false)
            throw new JSONRPCServer.Error(...Errors.CONNECTION_DENIED);
          const allWallets = await wallets.list();
          const walletPubKeys = await Promise.all(
            allWallets.map((w) => wallets.listKeys({ wallet: w }))
          );
          await connections.set(context.origin, {
            // TODO: Allow all wallets and keys for now
            allowList: {
              wallets: allWallets,
              publicKeys: walletPubKeys.flatMap((w) => w),
            },
            chainId: params.chainId,
            networkId: reply.networkId,
          });
        } else if (
          params.chainId != null &&
          (await connections.getChainId(context.origin)) !== params.chainId
        ) {
          throw new JSONRPCServer.Error(...Errors.MISMATCHING_CHAIN_ID);
        }

        context.isConnected = true;

        return null;
      },
      async 'client.disconnect_wallet'(params, context) {
        doValidate(clientValidation.disconnectWallet, params);
        // context.isConnected = false

        return null;
      },
      async 'client.is_connected'(params, context) {
        doValidate(clientValidation.isConnected, params);

        return context.isConnected === true;
      },
      async 'client.send_transaction'(params, context) {
        const receivedAt = new Date().toISOString();
        doValidate(clientValidation.sendTransaction, params);
        if (context.isConnected !== true)
          throw new JSONRPCServer.Error(...Errors.NOT_CONNECTED);
        if (
          (await connections.isAllowed(context.origin, params.publicKey)) ===
          false
        ) {
          throw new JSONRPCServer.Error(...Errors.UNKNOWN_PUBLIC_KEY);
        }

        const keyInfo = await wallets.getKeyInfo({
          publicKey: params.publicKey,
        });

        if (keyInfo == null)
          throw new JSONRPCServer.Error(...Errors.UNKNOWN_PUBLIC_KEY);
        const selectedNetworkId = await connections.getNetworkId(
          context.origin
        );
        const selectedChainId = await connections.getChainId(context.origin);
        const connection = await connections.get(context.origin);
        const transactionType = txHelpers.getTransactionType(
          params.transaction
        );
        const isLocked = encryptedStore.locked === true;
        const canBeAutoApproved =
          connection.autoConsent &&
          AUTO_CONSENT_TRANSACTION_TYPES.includes(transactionType) &&
          !isLocked;
        let approved = canBeAutoApproved;
        if (!canBeAutoApproved) {
          // if (action.openPopup && isIos()) {
          //   action.openPopup();
          // }
          approved = await interactor.reviewTransaction({
            transaction: params.transaction,
            publicKey: params.publicKey,
            name: keyInfo.name,
            wallet: keyInfo.wallet,
            sendingMode: params.sendingMode,
            origin: context.origin,
            chainId: selectedChainId,
            networkId: selectedNetworkId,
            receivedAt,
          });
        }

        const key = await wallets.getKeypair({ publicKey: params.publicKey });
        const network = await networks.get(selectedNetworkId, selectedChainId);

        if (approved === false) {
          const storedTx = await transactions.generateStoreTx({
            transaction: params.transaction,
            publicKey: params.publicKey,
            sendingMode: params.sendingMode,
            keyName: keyInfo.name,
            walletName: keyInfo.wallet,
            origin: context.origin,
            receivedAt,
            state: 'Rejected',
            autoApproved: canBeAutoApproved, // Should always be false here
          });
          await transactions.addTx(
            storedTx,
            keyInfo.walletName,
            keyInfo.publicKey
          );
          throw new JSONRPCServer.Error(...Errors.TRANSACTION_DENIED);
        }

        const rpc = await network.rpc();
        const storedTx = await transactions.generateStoreTx({
          transaction: params.transaction,
          publicKey: params.publicKey,
          sendingMode: params.sendingMode,
          keyName: keyInfo.name,
          walletName: keyInfo.wallet,
          origin: context.origin,
          receivedAt,
          autoApproved: canBeAutoApproved,
          node: rpc._url.toString(),
        });

        try {
          const res = await txHelpers.sendTransaction({
            keys: key.keyPair,
            rpc,
            sendingMode: params.sendingMode,
            transaction: params.transaction,
          });

          res.receivedAt = receivedAt;
          storedTx.hash = res.transactionHash;
          storedTx.state = 'Confirmed';
          return res;
        } catch (e) {
          storedTx.error = e.message;
          storedTx.state = 'Error';
          if (NodeRPC.isTxError(e)) {
            storedTx.hash = e.data.txHash;
            storedTx.code = e.data.code;
            throw new JSONRPCServer.Error(...Errors.TRANSACTION_FAILED, {
              message: e.message,
              ...e.data,
            });
          }

          throw e;
        } finally {
          await transactions.addTx(
            storedTx,
            keyInfo.walletName,
            keyInfo.publicKey
          );
        }
      },
      async 'client.sign_transaction'(params, context) {
        throw new JSONRPCServer.Error('Not Implemented', -32601);
      },
      async 'client.get_chain_id'(params, context) {
        doValidate(clientValidation.getChainId, params);

        if (context.isConnected === true) {
          const selectedNetworkId = await connections.getNetworkId(
            context.origin
          );
          const selectedChainId = await connections.getChainId(context.origin);
          const network = await networks.get(
            selectedNetworkId,
            selectedChainId
          );

          return { chainID: network.chainId };
        }

        const selectedNetworkId = await settings.get('selectedNetwork');
        const network = await networks.getByNetworkId(selectedNetworkId);

        return { chainID: network.chainId };
      },
      async 'client.list_keys'(params, context) {
        doValidate(clientValidation.listKeys, params);
        if (context.isConnected !== true)
          throw new JSONRPCServer.Error(...Errors.NOT_CONNECTED);

        const keys = await connections.listAllowedKeys(context.origin);

        return { keys };
      },
    },
  });
}
