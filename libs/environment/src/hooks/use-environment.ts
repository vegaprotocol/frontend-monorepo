import { parse as tomlParse } from 'toml';
import { LocalStorage, isValidUrl } from '@vegaprotocol/utils';
import { useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@vegaprotocol/apollo-client';
import {
  NodeCheckDocument,
  NodeCheckTimeUpdateDocument,
  type NodeCheckTimeUpdateSubscription,
  type NodeCheckQuery,
} from '../utils/__generated__/NodeCheck';
import {
  type CosmicElevatorFlags,
  type Environment,
  type FeatureFlags,
} from '../types';
import { Networks } from '../types';
import { compileErrors } from '../utils/compile-errors';
import { envSchema } from '../utils/validate-environment';
import { tomlConfigSchema } from '../utils/validate-configuration';
import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';
import first from 'lodash/first';
import { canMeasureResponseTime, measureResponseTime } from '../utils/time';
import compact from 'lodash/compact';

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

const VERSION = 1;
export const STORAGE_KEY = `vega_url_${VERSION}`;

const QUERY_TIMEOUT = 3000;
const SUBSCRIPTION_TIMEOUT = 3000;

const raceAgainst = (timeout: number): Promise<false> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, timeout);
  });

/**
 * Fetch and validate a vega node configuration
 */
const fetchConfig = async (url?: string) => {
  if (!url) return [];
  const res = await fetch(url);
  const content = await res.text();
  const parsed = tomlParse(content);
  const tomlResults = tomlConfigSchema.parse(parsed);
  const {
    API: {
      GraphQL: { Hosts },
    },
  } = tomlResults;
  return Hosts;
};

/**
 * Find a suitable nodes by running a test query and test
 * subscription, against a list of clients, first to resolve wins
 */
const findHealthyNodes = async (nodes: string[]) => {
  const clients: ClientCollection = {};
  nodes.forEach((url) => {
    clients[url] = createClient({
      url,
      cacheConfig: undefined,
      retry: false,
      connectToDevTools: false,
    });
  });
  const tests = Object.entries(clients).map((args) => testNode(...args));
  try {
    const nodes = await Promise.all(tests);
    const responsiveNodes = nodes
      .filter(([, q, s]) => q && s)
      .map(([url, q]) => {
        return {
          url,
          ...q,
        };
      });

    // more recent and faster at the top
    const ordered = orderBy(
      responsiveNodes,
      [(n) => n.blockHeight, (n) => n.vegaTime, (n) => n.responseTime],
      ['desc', 'desc', 'asc']
    );

    return ordered;
  } catch (err) {
    // All tests rejected, no suitable node found
    return [];
  }
};

type Maybe<T> = T | false;
type QueryTestResult = {
  blockHeight: number;
  vegaTime: Date;
  responseTime: number;
};
type SubscriptionTestResult = true;
type NodeTestResult = [
  /** url */
  string,
  Maybe<QueryTestResult>,
  Maybe<SubscriptionTestResult>
];
/**
 * Test a node for suitability for connection
 */
const testNode = async (
  url: string,
  client: Client
): Promise<NodeTestResult> => {
  const results = await Promise.all([
    testQuery(client, url),
    testSubscription(client),
  ]);
  return [url, ...results];
};

/**
 * Run a test query on a client
 */
const testQuery = (
  client: Client,
  url: string
): Promise<Maybe<QueryTestResult>> => {
  const test: Promise<Maybe<QueryTestResult>> = new Promise((resolve) =>
    client
      .query<NodeCheckQuery>({
        query: NodeCheckDocument,
      })
      .then((result) => {
        if (result && !result.error) {
          const netParams = compact(
            result.data.networkParametersConnection.edges?.map((n) => n?.node)
          );
          if (netParams.length === 0) {
            // any node that doesn't return the network parameters is considered
            // failed
            resolve(false);
            return;
          }
          const res = {
            blockHeight: Number(result.data.statistics.blockHeight),
            vegaTime: new Date(result.data.statistics.vegaTime),
            // only after a request has been sent we can retrieve the response time
            responseTime: canMeasureResponseTime(url)
              ? measureResponseTime(url) || Infinity
              : Infinity,
          } as QueryTestResult;
          resolve(res);
        } else {
          resolve(false);
        }
      })
      .catch(() => resolve(false))
  );
  return Promise.race([test, raceAgainst(QUERY_TIMEOUT)]);
};

/**
 * Run a test subscription on a client. A subscription
 * that takes longer than SUBSCRIPTION_TIMEOUT ms to respond
 * is deemed a failure
 */
const testSubscription = (
  client: Client
): Promise<Maybe<SubscriptionTestResult>> => {
  return new Promise((resolve) => {
    const sub = client
      .subscribe<NodeCheckTimeUpdateSubscription>({
        query: NodeCheckTimeUpdateDocument,
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

    setTimeout(() => {
      resolve(false);
      sub.unsubscribe();
    }, SUBSCRIPTION_TIMEOUT);
  });
};

export const userControllableFeatureFlags: (keyof FeatureFlags)[] = [];

/**
 * Retrieve env vars, parsing where needed some type casting is needed
 * here to appease the environment store interface
 */
const compileEnvVars = () => {
  const VEGA_ENV = windowOrDefault(
    'VEGA_ENV',
    process.env['NX_VEGA_ENV']
  ) as Networks;

  const env: Environment = {
    VEGA_URL: windowOrDefault('VEGA_URL', process.env['NX_VEGA_URL']),
    VEGA_ENV,
    VEGA_CONFIG_URL: windowOrDefault(
      'VEGA_CONFIG_URL',
      process.env['NX_VEGA_CONFIG_URL'] as string
    ),
    VEGA_NETWORKS: parseJSON(
      windowOrDefault('VEGA_NETWORKS', process.env['NX_VEGA_NETWORKS'])
    ),
    VEGA_WALLET_URL: windowOrDefault(
      'VEGA_WALLET_URL',
      process.env['NX_VEGA_WALLET_URL'] as string
    ),
    HOSTED_WALLET_URL: windowOrDefault(
      'HOSTED_WALLET_URL',
      process.env['NX_HOSTED_WALLET_URL']
    ),
    ETHERSCAN_URL: getEtherscanUrl(
      VEGA_ENV,
      windowOrDefault('ETHERSCAN_URL', process.env['NX_ETHERSCAN_URL'])
    ),
    ETHEREUM_RPC_URLS: getEthereumRpcUrls(
      windowOrDefault('ETHEREUM_RPC_URLS', process.env['NX_ETHEREUM_RPC_URLS'])
    ),
    ETHEREUM_CHAIN_ID: Number(
      windowOrDefault('ETHEREUM_CHAIN_ID', process.env['NX_ETHEREUM_CHAIN_ID'])
    ),
    ETH_LOCAL_PROVIDER_URL: windowOrDefault(
      'ETH_LOCAL_PROVIDER_URL',
      process.env['NX_ETH_LOCAL_PROVIDER_URL']
    ),
    ETH_WALLET_MNEMONIC: windowOrDefault(
      'ETH_WALLET_MNEMONIC',
      process.env['NX_ETH_WALLET_MNEMONIC']
    ),
    WALLETCONNECT_PROJECT_ID: windowOrDefault(
      'WALLETCONNECT_PROJECT_ID',
      process.env['NX_WALLETCONNECT_PROJECT_ID']
    ) as string,
    ORACLE_PROOFS_URL: windowOrDefault(
      'ORACLE_PROOFS_URL',
      process.env['NX_ORACLE_PROOFS_URL']
    ),
    VEGA_DOCS_URL: windowOrDefault(
      'VEGA_DOCS_URL',
      process.env['NX_VEGA_DOCS_URL']
    ),
    VEGA_CONSOLE_URL: windowOrDefault(
      'VEGA_CONSOLE_URL',
      process.env['NX_VEGA_CONSOLE_URL']
    ),
    VEGA_EXPLORER_URL: windowOrDefault(
      'VEGA_EXPLORER_URL',
      process.env['NX_VEGA_EXPLORER_URL']
    ),
    VEGA_TOKEN_URL: windowOrDefault(
      'VEGA_TOKEN_URL',
      process.env['NX_VEGA_TOKEN_URL']
    ),
    GITHUB_FEEDBACK_URL: windowOrDefault(
      'GITHUB_FEEDBACK_URL',
      process.env['NX_GITHUB_FEEDBACK_URL']
    ),
    GIT_BRANCH: windowOrDefault(
      'GIT_COMMIT_BRANCH',
      process.env['GIT_COMMIT_BRANCH']
    ),
    GIT_COMMIT_HASH: windowOrDefault(
      'GIT_COMMIT_HASH',
      process.env['GIT_COMMIT_HASH']
    ),
    GIT_ORIGIN_URL: windowOrDefault(
      'GIT_ORIGIN_URL',
      process.env['GIT_ORIGIN_URL']
    ),
    ANNOUNCEMENTS_CONFIG_URL: windowOrDefault(
      'ANNOUNCEMENTS_CONFIG_URL',
      process.env['NX_ANNOUNCEMENTS_CONFIG_URL']
    ),
    VEGA_INCIDENT_URL: windowOrDefault(
      'VEGA_INCIDENT_URL',
      process.env['NX_VEGA_INCIDENT_URL']
    ),
    APP_VERSION: windowOrDefault('APP_VERSION', process.env['NX_APP_VERSION']),
    SENTRY_DSN: windowOrDefault('SENTRY_DSN', process.env['NX_SENTRY_DSN']),
    TENDERMINT_URL: windowOrDefault(
      'NX_TENDERMINT_URL',
      process.env['NX_TENDERMINT_URL']
    ),
    TENDERMINT_WEBSOCKET_URL: windowOrDefault(
      'NX_TENDERMINT_WEBSOCKET_URL',
      process.env['NX_TENDERMINT_WEBSOCKET_URL']
    ),
    CHROME_EXTENSION_URL: windowOrDefault(
      'NX_CHROME_EXTENSION_URL',
      process.env['NX_CHROME_EXTENSION_URL']
    ),
    MOZILLA_EXTENSION_URL: windowOrDefault(
      'NX_MOZILLA_EXTENSION_URL',
      process.env['NX_MOZILLA_EXTENSION_URL']
    ),
    CHARTING_LIBRARY_PATH: windowOrDefault(
      'NX_CHARTING_LIBRARY_PATH',
      process.env['NX_CHARTING_LIBRARY_PATH'] as string
    ),
    CHARTING_LIBRARY_HASH: windowOrDefault(
      'NX_CHARTING_LIBRARY_HASH',
      process.env['NX_CHARTING_LIBRARY_HASH']
    ),
  };

  return env;
};

export const featureFlagsLocalStorageKey = 'vega_feature_flags';
let userEnabledFeatureFlags: (keyof FeatureFlags)[] | undefined = undefined;

export const setUserEnabledFeatureFlag = (
  flag: keyof FeatureFlags,
  enabled = false
) => {
  const enabledFlags = getUserEnabledFeatureFlags();
  if (enabled && !enabledFlags.includes(flag)) {
    enabledFlags.push(flag);
  }
  if (!enabled && enabledFlags.includes(flag)) {
    enabledFlags.splice(enabledFlags.indexOf(flag), 1);
  }
  userEnabledFeatureFlags = enabledFlags;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      featureFlagsLocalStorageKey,
      enabledFlags.join(',')
    );
  }
};

export const getUserEnabledFeatureFlags = (
  refresh = false,
  allowedFlags = userControllableFeatureFlags
): (keyof FeatureFlags)[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  if (typeof userEnabledFeatureFlags !== 'undefined' && !refresh) {
    return userEnabledFeatureFlags;
  }
  const enabledFlags = window.localStorage.getItem(featureFlagsLocalStorageKey);
  userEnabledFeatureFlags = enabledFlags
    ? uniq(
        (enabledFlags.split(',') as (keyof FeatureFlags)[]).filter((flag) =>
          allowedFlags.includes(flag)
        )
      )
    : [];
  return userEnabledFeatureFlags;
};

const TRUTHY = ['1', 'true'];
export const compileFeatureFlags = (refresh = false): FeatureFlags => {
  const COSMIC_ELEVATOR_FLAGS: CosmicElevatorFlags = {
    ICEBERG_ORDERS: TRUTHY.includes(
      windowOrDefault(
        'NX_ICEBERG_ORDERS',
        process.env['NX_ICEBERG_ORDERS']
      ) as string
    ),
    STOP_ORDERS: TRUTHY.includes(
      windowOrDefault('NX_STOP_ORDERS', process.env['NX_STOP_ORDERS']) as string
    ),
    TAKE_PROFIT_STOP_LOSS: TRUTHY.includes(
      windowOrDefault(
        'NX_TAKE_PROFIT_STOP_LOSS',
        process.env['NX_TAKE_PROFIT_STOP_LOSS']
      ) as string
    ),
    ISOLATED_MARGIN: TRUTHY.includes(
      windowOrDefault(
        'NX_ISOLATED_MARGIN',
        process.env['NX_ISOLATED_MARGIN']
      ) as string
    ),
    SUCCESSOR_MARKETS: TRUTHY.includes(
      windowOrDefault(
        'NX_SUCCESSOR_MARKETS',
        process.env['NX_SUCCESSOR_MARKETS']
      ) as string
    ),
    PRODUCT_PERPETUALS: TRUTHY.includes(
      windowOrDefault(
        'NX_PRODUCT_PERPETUALS',
        process.env['NX_PRODUCT_PERPETUALS']
      ) as string
    ),
    METAMASK_SNAPS: TRUTHY.includes(
      windowOrDefault(
        'NX_METAMASK_SNAPS',
        process.env['NX_METAMASK_SNAPS']
      ) as string
    ),
    REFERRALS: TRUTHY.includes(
      windowOrDefault('NX_REFERRALS', process.env['NX_REFERRALS']) as string
    ),
    DISABLE_CLOSE_POSITION: TRUTHY.includes(
      windowOrDefault(
        'NX_DISABLE_CLOSE_POSITION',
        process.env['NX_DISABLE_CLOSE_POSITION']
      ) as string
    ),
    UPDATE_MARKET_STATE: TRUTHY.includes(
      windowOrDefault(
        'NX_UPDATE_MARKET_STATE',
        process.env['NX_UPDATE_MARKET_STATE']
      ) as string
    ),
    GOVERNANCE_TRANSFERS: TRUTHY.includes(
      windowOrDefault(
        'NX_GOVERNANCE_TRANSFERS',
        process.env['NX_GOVERNANCE_TRANSFERS']
      ) as string
    ),
    VOLUME_DISCOUNTS: TRUTHY.includes(
      windowOrDefault(
        'NX_VOLUME_DISCOUNTS',
        process.env['NX_VOLUME_DISCOUNTS']
      ) as string
    ),
    TEAM_COMPETITION: TRUTHY.includes(
      windowOrDefault(
        'NX_TEAM_COMPETITION',
        process.env['NX_TEAM_COMPETITION']
      ) as string
    ),
  };

  const EXPLORER_FLAGS = {
    EXPLORER_ASSETS: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_ASSETS',
        process.env['NX_EXPLORER_ASSETS']
      ) as string
    ),
    EXPLORER_GENESIS: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_GENESIS',
        process.env['NX_EXPLORER_GENESIS']
      ) as string
    ),
    EXPLORER_GOVERNANCE: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_GOVERNANCE',
        process.env['NX_EXPLORER_GOVERNANCE']
      ) as string
    ),
    EXPLORER_MARKETS: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_MARKETS',
        process.env['NX_EXPLORER_MARKETS']
      ) as string
    ),
    EXPLORER_ORACLES: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_ORACLES',
        process.env['NX_EXPLORER_ORACLES']
      ) as string
    ),
    EXPLORER_TXS_LIST: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_TXS_LIST',
        process.env['NX_EXPLORER_TXS_LIST']
      ) as string
    ),
    EXPLORER_NETWORK_PARAMETERS: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_NETWORK_PARAMETERS',
        process.env['NX_EXPLORER_NETWORK_PARAMETERS']
      ) as string
    ),
    EXPLORER_PARTIES: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_PARTIES',
        process.env['NX_EXPLORER_PARTIES']
      ) as string
    ),
    EXPLORER_VALIDATORS: TRUTHY.includes(
      windowOrDefault(
        'NX_EXPLORER_VALIDATORS',
        process.env['NX_EXPLORER_VALIDATORS']
      ) as string
    ),
  };

  const GOVERNANCE_FLAGS = {
    GOVERNANCE_NETWORK_DOWN: TRUTHY.includes(
      windowOrDefault(
        'NX_NETWORK_DOWN',
        process.env['NX_NETWORK_DOWN']
      ) as string
    ),
    GOVERNANCE_NETWORK_LIMITS: TRUTHY.includes(
      windowOrDefault(
        'NX_GOVERNANCE_NETWORK_LIMITS',
        process.env['NX_GOVERNANCE_NETWORK_LIMITS']
      ) as string
    ),
  };
  const flags = {
    ...COSMIC_ELEVATOR_FLAGS,
    ...EXPLORER_FLAGS,
    ...GOVERNANCE_FLAGS,
  };
  getUserEnabledFeatureFlags(refresh).forEach((flag) => (flags[flag] = true));
  return flags;
};

const parseJSON = (value?: string) => {
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return {};
    }
  }
  return {};
};

/**
 * Provides a fallback ethereum provider url for test purposes in some apps
 */
const getEthereumRpcUrls = (envvar: string | undefined) => {
  if (!envvar) {
    throw new Error('ETHEREUM_RPC_URLS must be set');
  }

  const cfg = parseJSON(envvar);

  const obj: { [chainId: number]: string } = {};
  // convert keys to numbers
  for (const key in cfg) {
    obj[Number(key)] = cfg[key];
  }

  return obj;
};
/**
 * Provide a fallback etherscan url for test purposes in some apps
 */
const getEtherscanUrl = (
  network: Networks | undefined,
  envvar: string | undefined
) => {
  if (envvar) return envvar;
  return network === Networks.MAINNET
    ? 'https://etherscan.io'
    : 'https://sepolia.etherscan.io';
};

const windowOrDefault = (key: string, defaultValue?: string) => {
  if (typeof window !== 'undefined') {
    // @ts-ignore avoid conflict in env
    if (window._env_ && window._env_[key]) {
      // @ts-ignore presence has been check above
      return window._env_[key];
    }
  }
  return defaultValue || undefined;
};

export const useFeatureFlags = create<{
  flags: FeatureFlags;
  setFeatureFlag: (flag: keyof FeatureFlags, enabled: boolean) => void;
}>()((set, get) => ({
  flags: compileFeatureFlags(),
  setFeatureFlag: (flag: keyof FeatureFlags, enabled: boolean) => {
    if (userControllableFeatureFlags.includes(flag)) {
      setUserEnabledFeatureFlag(flag, enabled);
      set({ flags: { ...get().flags, [flag]: enabled } });
    }
  },
}));

export const useEnvironment = create<EnvStore>()((set, get) => ({
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

    // validate env vars
    try {
      const rawVars = compileEnvVars();
      const safeVars = envSchema.parse(rawVars);
      set({ ...safeVars });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const headline = 'Error processing the Vega environment';
      set({
        status: 'failed',
        error: headline,
      });
      console.error(compileErrors(headline, err));
      return;
    }

    const state = get();

    let storedUrl = LocalStorage.getItem(STORAGE_KEY);
    if (!isValidUrl(storedUrl)) {
      // remove invalid data from local storage
      LocalStorage.removeItem(STORAGE_KEY);
      storedUrl = null;
    }

    let nodes: string[] | undefined;
    try {
      nodes = uniq(
        compact([
          // url from local storage
          storedUrl,
          // url from state (if set via env var)
          state.VEGA_URL,
          // urls from network configuration
          ...(await fetchConfig(state.VEGA_CONFIG_URL)),
        ])
      );
      set({ nodes });
    } catch (err) {
      console.warn(`Could not fetch node config from ${state.VEGA_CONFIG_URL}`);
    }

    // skip picking up the best node if VEGA_URL env variable is set
    if (state.VEGA_URL && isValidUrl(state.VEGA_URL)) {
      state.setUrl(state.VEGA_URL);
      return;
    }

    // No url found in env vars or localStorage, AND no nodes were found in
    // the config fetched from VEGA_CONFIG_URL, app initialization has failed
    if (!nodes || !nodes.length) {
      set({
        status: 'failed',
        error: `Failed to fetch node config from ${state.VEGA_CONFIG_URL}`,
      });
      return;
    }

    const healthyNodes = await findHealthyNodes(nodes);

    // A requested node is a node to which the app was previously connected
    // or the one set via env variable.
    const requestedNodeUrl = storedUrl || state.VEGA_URL;

    const bestNode = first(healthyNodes);
    const requestedNode = healthyNodes.find(
      (n) => requestedNodeUrl && n.url === requestedNodeUrl
    );
    if (!requestedNode) {
      // remove unhealthy node url from local storage
      LocalStorage.removeItem(STORAGE_KEY);
    }
    // A node's url (VEGA_URL) is either the requested node (previously
    // connected or taken form env variable) or the currently best available
    // node.
    const url = requestedNode?.url || bestNode?.url;

    if (url != null) {
      state.setUrl(url);
      return;
    }

    set({
      status: 'failed',
      error: 'No suitable node found',
    });
    console.warn('No suitable node was found');
  },
}));

/**
 * Initialize Vega app to dynamically select a node from the
 * VEGA_CONFIG_URL
 *
 * This can be omitted if you intend to only use a single node,
 * in those cases be sure to set NX_VEGA_URL
 */
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

export const ENV = compileEnvVars();
