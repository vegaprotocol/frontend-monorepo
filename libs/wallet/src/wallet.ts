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
export const singleKeyStoreSlice: SingleKeyStore = {
  pubKey: undefined,
};

// get/set functions are not used in the slices so these
// can be plain objects
export const coreStoreSlice: CoreStore = {
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
      ...coreStoreSlice,
      ...singleKeyStoreSlice,
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
      return { status: 'connecting' as const };
    }

    try {
      const connector = connectors.getState().find((c) => c.id === id);

      if (!connector) {
        throw ConnectorErrors.noConnector;
      }

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

      connector.off('client.disconnected');
      connector.on('client.disconnected', disconnect);

      return { status: 'connected' as const };
    } catch (err) {
      store.setState({
        status: 'disconnected',
        current: undefined,
        keys: [],
        error: err instanceof ConnectorError ? err : ConnectorErrors.unknown,
      });
      return { status: 'disconnected' as const };
    }
  }

  async function disconnect() {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    try {
      if (!connector) {
        throw ConnectorErrors.noConnector;
      }

      connector.off('client.disconnected');

      await connector.disconnectWallet();

      store.setState(getInitialState(), true);
      return { status: 'connected' as const };
    } catch (err) {
      store.setState({
        ...getInitialState(),
        error: err instanceof ConnectorError ? err : ConnectorErrors.unknown,
      });
      return { status: 'disconnected' as const };
    }
  }

  async function refreshKeys() {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    try {
      if (!connector) {
        throw ConnectorErrors.noConnector;
      }

      const keys = await connector.listKeys();
      store.setState({ keys });
    } catch (err) {
      store.setState({
        error: err instanceof ConnectorError ? err : ConnectorErrors.unknown,
      });
    }
  }

  async function sendTransaction(params: TransactionParams) {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    try {
      if (!connector) {
        throw ConnectorErrors.noConnector;
      }
      return connector.sendTransaction(params);
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw ConnectorErrors.unknown;
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
