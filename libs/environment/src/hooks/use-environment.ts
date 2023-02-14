import { isValidUrl, LocalStorage, t } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@vegaprotocol/apollo-client';
import type {
  BlockTimeSubscription,
  StatisticsQuery,
} from '../utils/__generated__/Node';
import { BlockTimeDocument } from '../utils/__generated__/Node';
import { StatisticsDocument } from '../utils/__generated__/Node';
import type { Environment, Networks } from '../types';
import { compileErrors } from '../utils/compile-errors';
import { envSchema } from '../utils/validate-environment';
import { configSchema } from '../utils/validate-configuration';

type Client = ReturnType<typeof createClient>;
type ClientCollection = {
  [node: string]: Client;
};
type EnvState = {
  nodes: string[];
  status: 'default' | 'pending' | 'success' | 'failed';
  error: string | null;
};
type Actions = {
  setUrl: (url: string) => void;
  initialize: () => Promise<void>;
};
export type Env = Environment & EnvState;
export type EnvStore = Env & Actions;

const STORAGE_KEY = 'vega_url';

export const useEnvironment = create<EnvStore>((set, get) => ({
  ...compileEnvVars(),
  nodes: [],
  status: 'default',
  error: null,
  setUrl: (url) => {
    set({ VEGA_URL: url, status: 'success', error: null });
    LocalStorage.setItem(STORAGE_KEY, url);
  },
  initialize: async () => {
    set({ status: 'pending' });

    try {
      const rawVars = compileEnvVars();
      const safeVars = envSchema.parse(rawVars);
      set({ ...safeVars });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({
        status: 'failed',
        error: t('Error processing the Vega environemnt'),
      });

      console.error(
        compileErrors(t('Error processing the Vega environment'), err)
      );
      return;
    }

    const state = get();
    const storedUrl = LocalStorage.getItem(STORAGE_KEY);

    let nodes: string[] | undefined;
    try {
      nodes = await fetchConfig(state.VEGA_CONFIG_URL);
      set({ nodes });
    } catch (err) {
      console.warn(`could not fetch node config from ${state.VEGA_CONFIG_URL}`);
    }

    // user has previously loaded the app and found
    // a successful node, or chosen one manually - reconnect
    // to same node
    if (storedUrl) {
      if (isValidUrl(storedUrl)) {
        set({ VEGA_URL: storedUrl, status: 'success' });
        return;
      } else {
        LocalStorage.removeItem(STORAGE_KEY);
      }
    }

    // VEGA_URL env var is set no need to find suitable node
    if (state.VEGA_URL) {
      set({ status: 'success' });
      return;
    }

    if (!nodes || !nodes.length) {
      set({
        status: 'failed',
        error: t(`Failed to fetch node config from ${state.VEGA_CONFIG_URL}`),
      });
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
      LocalStorage.setItem(STORAGE_KEY, url);
    } else {
      set({
        status: 'failed',
        error: t('No node found'),
      });
      console.warn(t('No suitable vega node was found'));
    }
  },
}));

// Use this to fetch node config and find suitable node
// if no NX_VEGA_URL is not provided
export const useInitializeEnv = () => {
  const { initialize, status } = useEnvironment((store) => ({
    status: store.status,
    initialize: store.initialize,
  }));

  useEffect(() => {
    if (status === 'default') {
      initialize();
    }
  }, [status, initialize]);
};

const fetchConfig = async (url?: string) => {
  if (!url) return [];
  const res = await fetch(url);
  const cfg = await res.json();
  const result = configSchema.parse(cfg);
  return result.hosts;
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

function compileEnvVars() {
  const env = {
    VEGA_URL: process.env['NX_VEGA_URL'],
    VEGA_ENV: process.env['NX_VEGA_ENV'] as Networks,
    VEGA_CONFIG_URL: process.env['NX_VEGA_CONFIG_URL'] as string,
    VEGA_NETWORKS: parseJSON(process.env['NX_VEGA_NETWORKS']),
    VEGA_WALLET_URL: process.env['NX_VEGA_WALLET_URL'] as string,
    HOSTED_WALLET_URL: process.env['NX_HOSTED_WALLET_URL'],
    ETHERSCAN_URL: process.env['NX_ETHERSCAN_URL'] as string,
    ETHEREUM_PROVIDER_URL: process.env['NX_ETHEREUM_PROVIDER_URL'] as string,
    ETH_LOCAL_PROVIDER_URL: process.env['NX_ETH_LOCAL_PROVIDER_URL'],
    ETH_WALLET_MNEMONIC: process.env['NX_ETH_WALLET_MNEMONIC'],
    VEGA_DOCS_URL: process.env['NX_VEGA_DOCS_URL'],
    VEGA_EXPLORER_URL: process.env['NX_VEGA_EXPLORER_URL'],
    VEGA_TOKEN_URL: process.env['NX_TOKEN_URL'],
    GITHUB_FEEDBACK_URL: process.env['NX_GITHUB_FEEDBACK_URL'],
    MAINTENANCE_PAGE: parseBoolean(process.env['NX_MAINTENANCE_PAGE']),
    GIT_BRANCH: process.env['GIT_COMMIT_BRANCH'],
    GIT_COMMIT_HASH: process.env['GIT_COMMIT_HASH'],
    GIT_ORIGIN_URL: process.env['GIT_ORIGIN_URL'],
  };

  return env;
}

function parseJSON(value?: string) {
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function parseBoolean(value?: string) {
  return ['true', '1', 'yes'].includes(value?.toLowerCase() || '');
}
