import { StoreApi, createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

import { InjectedConnector } from './injected-connector';
import { JsonRpcConnector } from './json-rpc-connector';
import { SnapConnector } from './snap-connector';
import { Chain, fairground, stagnet } from './chains';
import { Connector } from '.';
import {
  PropsWithChildren,
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';

const injected = new InjectedConnector();
const jsonRpc = new JsonRpcConnector({
  url: 'http://localhost:1789/api/v2/requests',
});
const snap = new SnapConnector({
  node: 'https://api.n08.testnet.vega.rocks',
  id: 'npm:@vegaprotocol/snap',
  version: '0.3.1',
});

type Key = {
  publicKey: string;
  name: string;
};

type Store = {
  chainId: string;
  status: 'disconnected' | 'connecting' | 'connected';
  current: string | undefined;
  keys: Key[];
  setKeys: (keys: Key[]) => void;
};

type Config = { chains: Chain[]; connectors: Connector[] };

type Wallet = {
  store: StoreApi<Store>;
  connectors: Connector[];
  connect: (id: string) => Promise<void>;
  disconnect: () => Promise<void>;
};

function createConfig(cfg: Config): Wallet {
  const connectors = createStore(() => cfg.connectors);

  const store = createStore<Store>((set) => ({
    chainId: cfg.chains[0].id,
    status: 'disconnected',
    current: undefined,
    keys: [],
    setKeys: (keys) => {
      set({ keys });
    },
  }));

  async function connect(id: string) {
    if (store.getState().status === 'connecting') {
      return;
    }

    const connector = connectors.getState().find((x) => x.id === id);

    if (!connector) return;

    try {
      store.setState({ status: 'connecting', current: id });

      const connectWalletRes = await connector.connectWallet(
        store.getState().chainId
      );

      if ('error' in connectWalletRes) {
        throw new Error('failed to connect');
      }

      const listKeysRes = await connector.listKeys();

      if ('error' in listKeysRes) {
        throw new Error('failed to get keys');
      }

      store.setState({
        keys: listKeysRes,
        status: 'connected',
      });
    } catch (err) {
      console.error(err);
      store.setState({ status: 'disconnected', current: undefined, keys: [] });
    }
  }

  async function disconnect() {
    const connector = connectors
      .getState()
      .find((x) => x.id === store.getState().current);

    if (!connector) return;

    store.setState({ status: 'disconnected', current: undefined, keys: [] });
  }

  return {
    store,
    connect,
    disconnect,

    get connectors() {
      return connectors.getState();
    },
  };
}

const config = createConfig({
  chains: [fairground, stagnet],
  connectors: [injected, jsonRpc, snap],
});

function useWallet<T>(selector: (store: Store) => T) {
  const store = useStore(config.store, selector);

  return store;
}

function useConfig() {
  const context = useContext(VegaWalletContext);
  if (context === undefined) {
    throw new Error('must be used within VegaWalletProvider');
  }
  return context;
}

function useConnect() {
  const config = useConfig();
  return {
    connectors: config.connectors,
    connect: config.connect,
  };
}

function useDisconnect() {
  const config = useConfig();
  return {
    disconnect: config.disconnect,
  };
}

const VegaWalletContext = createContext<Wallet | undefined>(undefined);

function VegaWalletProvider({
  children,
  config,
}: PropsWithChildren<{ config: Wallet }>) {
  return createElement(VegaWalletContext.Provider, { value: config }, children);
}

export function Test() {
  return (
    <VegaWalletProvider config={config}>
      <App />
    </VegaWalletProvider>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const status = useWallet((store) => store.status);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Connect</button>
      <Dialog open={open}>
        <div>
          {status === 'disconnected' && (
            <div className="flex gap-2">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={async () => {
                    try {
                      await connect(c.id);
                      setTimeout(() => {
                        setOpen(false);
                      }, 1000);
                    } catch (err) {}
                  }}
                >
                  connect {c.id}
                </button>
              ))}
            </div>
          )}
          {status === 'connecting' && <div>Approve connection in wallet</div>}
          {status === 'connected' && <div>Connected!</div>}
        </div>
      </Dialog>
      <hr className="border-t pt-2 mt-2" />
      <div className="flex flex-col items-start gap-2">
        <button onClick={() => disconnect()}>diconnectWallet</button>
      </div>
      <div>{status}</div>
      <Keys />
      {/* <NoReact /> */}
    </div>
  );
}

const Keys = () => {
  const keys = useWallet((store) => store.keys);

  if (!keys.length) {
    return <p>No keys</p>;
  }

  return (
    <ul>
      {keys.map((k) => {
        return (
          <li key={k.publicKey}>
            {k.name} {k.publicKey}
          </li>
        );
      })}
    </ul>
  );
};

const NoReact = () => {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!divRef.current) return;
    const div = divRef.current;

    const button = document.createElement('button');
    button.addEventListener('click', () => {
      config.connect('injected'); // should fail
    });
    button.textContent = 'Connect injected';

    const status = document.createElement('div');
    const keys = document.createElement('ul');

    config.store.subscribe((state) => {
      status.textContent = state.status;

      state.keys.forEach((key) => {
        const li = document.createElement('li');
        li.textContent = `${key.name} ${key.publicKey}`;
        keys.appendChild(li);
      });
    });

    div.appendChild(button);
    div.appendChild(status);
    div.appendChild(keys);
  }, []);
  return (
    <div>
      <h1>No react</h1>
      <div ref={divRef} />
    </div>
  );
};
