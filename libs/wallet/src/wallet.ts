import { createStore, type StateCreator } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import {
  type PropsWithChildren,
  createContext,
  createElement,
  useContext,
} from 'react';
import {
  type Wallet,
  type Config,
  type Store,
  type TransactionParams,
  type SingleKeyStore,
  type CoreStore,
} from './types';
import { useStore } from 'zustand';

export const createSingleKeyStore: StateCreator<SingleKeyStore> = (set) => ({
  pubKey: undefined,
  setPubKey: (key) => {
    set({ pubKey: key });
  },
});

export function createConfig(cfg: Config): Wallet {
  const connectors = createStore(() => cfg.connectors);

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
          };
        },
      }
    )
  );

  async function connect(id: string) {
    if (store.getState().status === 'connecting') {
      return;
    }

    const connector = connectors.getState().find((x) => x.id === id);

    if (!connector) return;

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
    } catch (err) {
      store.setState({
        status: 'disconnected',
        current: undefined,
        keys: [],
        error: err instanceof Error ? err.message : 'failed to connect',
      });
    }
  }

  async function disconnect() {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    if (!connector) return;

    await connector.disconnectWallet();

    store.setState({
      status: 'disconnected',
      current: undefined,
      keys: [],
      pubKey: undefined,
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
    sendTransaction,
    setStoreState,

    get connectors() {
      return connectors.getState();
    },
  };
}

//////////////////////////////////////////////////////////
// REACT
//////////////////////////////////////////////////////////

const VegaWalletContext = createContext<Wallet | undefined>(undefined);

export function VegaWalletProvider({
  children,
  config,
}: PropsWithChildren<{ config: Wallet }>) {
  return createElement(VegaWalletContext.Provider, { value: config }, children);
}

export function useConfig() {
  const context = useContext(VegaWalletContext);
  if (context === undefined) {
    throw new Error('must be used within VegaWalletProvider');
  }
  return context;
}

export function useWallet<T>(selector: (store: Store) => T) {
  const config = useConfig();
  const store = useStore(config.store, selector);

  return store;
}

export function useConnect() {
  const config = useConfig();
  return {
    connectors: config.connectors,
    connect: config.connect,
  };
}

export function useDisconnect() {
  const config = useConfig();
  return {
    disconnect: config.disconnect,
  };
}

export function useSendTransaction() {
  const config = useConfig();
  return {
    sendTransaction: config.sendTransaction,
  };
}

export function usePubKeys() {
  const keys = useWallet((store) => store.keys);
  return {
    pubKeys: keys,
  };
}
