import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import {
  type Wallet,
  type Config,
  type Store,
  type TransactionParams,
  type SingleKeyStore,
  type CoreStore,
  type Connector,
  type ConnectorType,
} from './types';
import { ConnectorError, ConnectorErrors } from './connectors';

// get/set functions are not used in the slices so these
// can be plain objects
export const createSingleKeySlice: SingleKeyStore = {
  pubKey: undefined,
};

// get/set functions are not used in the slices so these
// can be plain objects
export const createCoreStoreSlice: CoreStore = {
  chainId: '',
  status: 'disconnected',
  current: undefined,
  keys: [],
  error: undefined,
  jsonRpcToken: undefined,
};

export function createConfig(cfg: Config): Wallet {
  const chain = cfg.chains.find((c) => c.id === cfg.defaultChainId);

  if (!chain) {
    throw new Error('default chain not found in config');
  }

  const getInitialState = () => {
    return {
      ...createCoreStoreSlice,
      ...createSingleKeySlice,
      chainId: chain.id,
    };
  };

  const store = createStore<Store>()(
    persist(getInitialState, {
      name: 'vega_wallet_store',
      partialize(state) {
        return {
          chainId: state.chainId,
          current: state.current,
          pubKey: state.pubKey,
          jsonRpcToken: state.jsonRpcToken,
        };
      },
    })
  );

  const connectors = createStore(() => cfg.connectors.map(bindStore));

  function bindStore(connector: Connector) {
    connector.bindStore(store);
    return connector;
  }

  async function connect(id: ConnectorType) {
    if (store.getState().status === 'connecting') {
      return;
    }

    const connector = connectors.getState().find((c) => c.id === id);

    if (!connector) {
      return { success: false };
    }

    try {
      store.setState({ status: 'connecting', current: id, error: undefined });

      await connector.connectWallet(store.getState().chainId);
      const keys = await connector.listKeys();

      // TODO: this shouldnt be in core as we dont want to enforce single key usage
      const storedPubKey = store.getState().pubKey;
      let defaultKey;
      if (keys.find((k) => k.publicKey === storedPubKey)) {
        defaultKey = storedPubKey;
      } else {
        defaultKey = keys[0].publicKey;
      }

      store.setState({
        keys,
        status: 'connected',
        pubKey: defaultKey,
      });

      // TODO: is there a better way to do this
      connector.off('client.disconnected');
      connector.on('client.disconnected', disconnect);

      return { success: true };
    } catch (err) {
      store.setState({
        status: 'disconnected',
        current: undefined,
        keys: [],
        error: err instanceof ConnectorError ? err : ConnectorErrors.unknown,
      });
      return { success: false };
    }
  }

  async function disconnect() {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    if (!connector) {
      return { success: false };
    }

    connector.off('client.disconnected');

    await connector.disconnectWallet();

    store.setState({
      status: 'disconnected',
      current: undefined,
      keys: [],
      pubKey: undefined,
      jsonRpcToken: undefined,
    });

    return { success: true };
  }

  async function refreshKeys() {
    const current = store.getState().current;
    const connector = connectors.getState().find((c) => c.id === current);

    if (!connector) {
      return;
    }

    const listKeysRes = await connector.listKeys();

    if ('error' in listKeysRes) {
      return;
    }

    store.setState({
      keys: listKeysRes,
    });
  }

  async function sendTransaction(params: TransactionParams) {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    if (!connector) {
      return {
        error: 'no connector',
      };
    }

    try {
      const res = await connector.sendTransaction(params);

      return res;
      // eslint-disable-next-line
      console.log('res', res);
    } catch (err) {
      return {
        error: 'failed to send',
      };
      // eslint-disable-next-line
      console.error(err);
    }
  }

  function reset() {
    store.setState(getInitialState(), true);
  }

  return {
    store,
    connect,
    disconnect,
    refreshKeys,
    sendTransaction,
    reset,

    get connectors() {
      return connectors.getState();
    },
  };
}
