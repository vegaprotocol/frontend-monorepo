import { LocalStorage } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@vegaprotocol/apollo-client';
import type { StatisticsQuery } from '../utils/__generated__/Node';
import { StatisticsDocument } from '../utils/__generated__/Node';
import type { Networks } from '../types';

type Client = ReturnType<typeof createClient>;
type ClientCollection = {
  [node: string]: Client;
};

interface Env {
  VEGA_URL: string;
  VEGA_ENV: Networks;
  VEGA_NETWORKS: Record<Networks, string>;
  VEGA_CONFIG_URL: string;
  GIT_BRANCH: string;
  GIT_COMMIT_HASH: string;
  GIT_ORIGIN_URL: string;
  ETHEREUM_PROVIDER_URL: string;
  ETH_LOCAL_PROVIDER_URL: string;
  ETH_WALLET_MNEMONIC: string;
  ETHERSCAN_URL: string;
  VEGA_DOCS_URL: string;
  VEGA_EXPLORER_URL: string;
  VEGA_TOKEN_URL: string;
  GITHUB_FEEDBACK_URL: string;
  VEGA_WALLET_URL: string;
  HOSTED_WALLET_URL: string;
  nodes: string[];
  status: 'default' | 'pending' | 'success' | 'failed';
}

interface Actions {
  setUrl: (url: string) => void;
  initialize: () => Promise<void>;
}

export const useEnvironment = create<Env & Actions>((set, get) => ({
  VEGA_URL: process.env['NX_VEGA_URL'] || '',
  VEGA_ENV: process.env['NX_VEGA_ENV'] as Networks,
  VEGA_NETWORKS: JSON.parse(process.env['NX_VEGA_NETWORKS'] || '{}') as Record<
    Networks,
    string
  >,
  GIT_BRANCH: process.env['GIT_COMMIT_BRANCH'] || '',
  GIT_COMMIT_HASH: process.env['GIT_COMMIT_HASH'] || '',
  GIT_ORIGIN_URL: process.env['GIT_ORIGIN_URL'] || '',
  ETHEREUM_PROVIDER_URL: process.env['NX_ETHEREUM_PROVIDER_URL'] || '',
  ETH_LOCAL_PROVIDER_URL: process.env['NX_ETH_LOCAL_PROVIDER_URL'] || '',
  ETH_WALLET_MNEMONIC: process.env['NX_ETH_WALLET_MNEMONIC'] || '',
  ETHERSCAN_URL: process.env['NX_ETHERSCAN_URL'] || '',
  VEGA_DOCS_URL: process.env['NX_VEGA_DOCS_URL'] || '',
  VEGA_EXPLORER_URL: process.env['NX_VEGA_EXPLORER_URL'] || '',
  VEGA_TOKEN_URL: process.env['NX_TOKEN_URL'] || '',
  GITHUB_FEEDBACK_URL: process.env['NX_GITHUB_FEEDBACK_URL'] || '',
  VEGA_WALLET_URL: process.env['NX_VEGA_WALLET_URL'] || '',
  HOSTED_WALLET_URL: process.env['NX_HOSTED_WALLET_URL'] || '',
  VEGA_CONFIG_URL: process.env['NX_VEGA_CONFIG_URL'] || '',
  nodes: [],
  status: 'default',
  setUrl: (url) => {
    set({ VEGA_URL: url });
    LocalStorage.setItem('vega_url', url);
  },
  initialize: async () => {
    const state = get();
    if (state.status === 'pending') return;
    const storedUrl = LocalStorage.getItem('vega_url');
    set({ status: 'pending' });
    const nodes = await fetchConfig(state.VEGA_CONFIG_URL);
    set({ nodes });

    // user has previously loaded the app and found
    // a successful node, or chosen one manually - reconnect
    // to same node
    if (storedUrl) {
      set({ VEGA_URL: storedUrl, status: 'success' });
      return;
    }

    if (state.VEGA_URL) {
      set({ status: 'success' });
      return;
    }

    // create client and store instances
    const clients: ClientCollection = {};
    nodes.forEach((url) => {
      clients[url] = createClient({
        url,
        cacheConfig: undefined,
        retry: false,
        connectToDevTools: false,
      });
    });

    // find a suitable node to connected, first one to respond is chosen
    const url = await findNode(clients);

    if (url !== null) {
      set({
        status: 'success',
        VEGA_URL: url,
      });
      LocalStorage.setItem('vega_url', url);
    } else {
      // TODO: handle this

      // no suitable node was found
      throw new Error('no node found');
    }
  },
}));

export const useInitializeEnv = () => {
  const { initialize, ...env } = useEnvironment();

  useEffect(() => {
    if (env.status === 'default') {
      initialize();
    }
  }, [env.status, initialize]);
};

const fetchConfig = async (url: string): Promise<string[]> => {
  const res = await fetch(url);
  const cfg = await res.json();
  return cfg.hosts;
};

const findNode = (clients: ClientCollection): Promise<string | null> => {
  const tests = Object.entries(clients).map((args) => testNode(...args));
  return Promise.race(tests);
};

const testNode = async (
  url: string,
  client: Client
): Promise<string | null> => {
  try {
    // const results = await Promise.all([
    //   testQuery(client),
    //   testSubscription(client),
    // ]);
    const success = await testQuery(client);
    if (success) {
      return url;
    }
    return null;
  } catch (err) {
    console.warn(`tests failed for ${url}`);
    return null;
  }
};

const testQuery = async (client: Client) => {
  try {
    const result = await client.query<StatisticsQuery>({
      query: StatisticsDocument,
    });
    if (!result || result.error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

// const testSubscription = (client: Client) => {
//   return new Promise((resolve) => {
//     const sub = client
//       .subscribe<BlockTimeSubscription>({
//         query: BlockTimeDocument,
//         errorPolicy: 'all',
//       })
//       .subscribe({
//         next: () => {
//           resolve(true);
//           sub.unsubscribe();
//         },
//         error: () => {
//           resolve(false);
//           sub.unsubscribe();
//         },
//       });
//   });
// };
