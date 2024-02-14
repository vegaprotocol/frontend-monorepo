import { createStore, type StateCreator } from 'zustand/vanilla';
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

export const createSingleKeyStore: StateCreator<SingleKeyStore> = (set) => ({
  pubKey: undefined,
  setPubKey: (key) => {
    set({ pubKey: key });
  },
});

export function createConfig(cfg: Config): Wallet {
  const chain = cfg.chains.find((c) => c.id === cfg.defaultChainId);

  if (!chain) {
    throw new Error('default chain not found in config');
  }

  const createStoreSlice: StateCreator<CoreStore> = (set) => ({
    chainId: chain.id,
    status: 'disconnected',
    current: undefined,
    keys: [],
    setKeys: (keys) => {
      set({ keys });
    },
    error: undefined,
    jsonRpcToken: undefined,
  });

  const store = createStore<Store>()(
    persist(
      (...args) => ({
        ...createStoreSlice(...args),
        ...createSingleKeyStore(...args),
      }),
      {
        name: 'vega_wallet_store',
        partialize(state) {
          return {
            chainId: state.chainId,
            current: state.current,
            pubKey: state.pubKey,
            jsonRpcToken: state.jsonRpcToken,
          };
        },
      }
    )
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

      const connectWalletRes = await connector.connectWallet(
        store.getState().chainId
      );

      if ('error' in connectWalletRes) {
        throw new Error(connectWalletRes.error);
      }

      const listKeysRes = await connector.listKeys();

      if ('error' in listKeysRes) {
        throw new Error('failed to get keys');
      }

      const storedPubKey = store.getState().pubKey;
      let defaultKey;
      if (listKeysRes.find((k) => k.publicKey === storedPubKey)) {
        defaultKey = storedPubKey;
      } else {
        defaultKey = listKeysRes[0].publicKey;
      }

      store.setState({
        keys: listKeysRes,
        status: 'connected',
        pubKey: defaultKey,
      });

      connector.on('client.disconnected', disconnect);

      return { success: true };
    } catch (err) {
      store.setState({
        status: 'disconnected',
        current: undefined,
        keys: [],
        error: err instanceof Error ? err.message : 'failed to connect',
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
      console.log('res', res);
    } catch (err) {
      return {
        error: 'failed to send',
      };
      console.error(err);
    }
  }

  function setStoreState(state: Partial<Store>) {
    store.setState(state);
  }

  return {
    store,
    connect,
    disconnect,
    refreshKeys,
    sendTransaction,
    setStoreState,

    get connectors() {
      return connectors.getState();
    },
  };
}
