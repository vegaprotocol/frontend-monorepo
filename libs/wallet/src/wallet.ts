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
import { ConnectorError, noConnectorError, unknownError } from './errors';

export const STORE_KEY = 'vega_wallet_store';

// get/set functions are not used in the slices so these
// can be plain objects
export const singleKeyStoreSlice: SingleKeyStore = {
  pubKey: undefined,
  previousKey: undefined,
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
      name: STORE_KEY,
      partialize(state) {
        return {
          chainId: state.chainId,
          current: state.current,
          pubKey: state.pubKey,
          previousKey: state.pubKey,
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
        throw noConnectorError();
      }

      store.setState({ status: 'connecting', current: id, error: undefined });

      await connector.connectWallet(store.getState().chainId);
      const keys = await connector.listKeys();

      // TODO: this shouldnt be in the default config as we dont want to enforce single key usage
      // need to find a way to optin into using this slice in the store
      const storedPubKey = store.getState().previousKey;
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
        previousKey: defaultKey,
      });

      connector.off('client.disconnected', disconnect);
      connector.on('client.disconnected', disconnect);

      return { status: 'connected' as const };
    } catch (err) {
      store.setState({
        status: 'disconnected',
        current: undefined,
        keys: [],
        error: err instanceof ConnectorError ? err : unknownError(),
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
        throw noConnectorError();
      }

      connector.off('client.disconnected');

      await connector.disconnectWallet();

      store.setState(getInitialState(), true);
      return { status: 'disconnected' as const };
    } catch (err) {
      store.setState(getInitialState(), true);
      return { status: 'disconnected' as const };
    }
  }

  async function refreshKeys() {
    const state = store.getState();
    const connector = connectors.getState().find((x) => x.id === state.current);

    // Only refresh keys if connnected. If you aren't connect when you connect
    // you will get the latest keys
    if (state.status !== 'connected') {
      return;
    }

    try {
      if (!connector) {
        throw noConnectorError();
      }

      const keys = await connector.listKeys();
      store.setState({ keys });
    } catch (err) {
      store.setState({
        error: err instanceof ConnectorError ? err : unknownError(),
      });
    }
  }

  async function sendTransaction(params: TransactionParams) {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    try {
      if (!connector) {
        throw noConnectorError();
      }
      return connector.sendTransaction(params);
    } catch (err) {
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw unknownError();
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
    walletConfig: cfg.walletConfig,
    appName: cfg.appName,

    get connectors() {
      return connectors.getState();
    },
  };
}
