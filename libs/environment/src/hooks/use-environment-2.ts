import { LocalStorage } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@vegaprotocol/apollo-client';
import type {
  BlockTimeSubscription,
  StatisticsQuery,
} from '../utils/__generated__/Node';
import {
  BlockTimeDocument,
  StatisticsDocument,
} from '../utils/__generated__/Node';

type Client = ReturnType<typeof createClient>;
type ClientCollection = {
  [node: string]: Client;
};
export const clients: ClientCollection = {};

interface Env {
  url: string;
  configUrl: string;
  nodes: string[];
  status: 'default' | 'pending' | 'success' | 'failed';
}

interface Actions {
  setUrl: (url: string) => void;
  initialize: () => Promise<void>;
}

export const useEnvironment2 = create<Env & Actions>((set, get) => ({
  url: process.env['NX_VEGA_URL'] || '',
  vegaEnv: process.env['NX_VEGA_ENV'] || '',
  configUrl: process.env['NX_VEGA_CONFIG_URL'] || '',
  nodes: [],
  status: 'default',
  setUrl: (url) => {
    set({ url });
  },
  initialize: async () => {
    const state = get();
    if (state.status === 'pending') return;
    const storedUrl = LocalStorage.getItem('vega_url');
    set({ status: 'pending' });
    const nodes = await fetchConfig(state.configUrl);
    set({ nodes });

    // create client and store instances
    nodes.forEach((url) => {
      clients[url] = createClient({
        url,
        cacheConfig: undefined,
        retry: false,
        connectToDevTools: false,
      });
    });

    if (storedUrl) {
      set({ url: storedUrl, status: 'success' });
    } else {
      const url = await findNode(clients);
      set({
        status: url ? 'success' : 'failed',
        url: url ? url : '',
      });
    }
  },
}));

export const useInitializeEnv = () => {
  const { initialize, ...env } = useEnvironment2();

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
    const results = await Promise.all([
      testQuery(client),
      testSubscription(client),
    ]);
    if (results[0] && results[1]) {
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

const testSubscription = (client: Client) => {
  return new Promise((resolve) => {
    const sub = client
      .subscribe<BlockTimeSubscription>({
        query: BlockTimeDocument,
        errorPolicy: 'all',
      })
      .subscribe({
        next: () => {
          resolve(true);
          sub.unsubscribe();
        },
        error: () => {
          resolve(false);
          sub.unsubscribe();
        },
      });
  });
};
