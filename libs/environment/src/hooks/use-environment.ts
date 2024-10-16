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
import { type Environment, type FeatureFlags } from '../types';
import { Networks } from '../types';
import { compileErrors } from '../utils/compile-errors';
import { tomlConfigSchema } from '../utils/validate-configuration';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import first from 'lodash/first';
import { canMeasureResponseTime, measureResponseTime } from '../utils/time';
import compact from 'lodash/compact';
import trimEnd from 'lodash/trimEnd';
import { z } from 'zod';
import {
  envSchema,
  storedApiNodeSchema,
  type ApiNode,
} from '../utils/validate-environment';

const VERSION = 2;
export const STORAGE_KEY = `vega_api_node_${VERSION}`;

const getStoredApiNode = () => {
  const value = LocalStorage.getItem(STORAGE_KEY);
  return storedApiNodeSchema.parse(value);
};
const storeApiNode = (apiNode: ApiNode) => {
  LocalStorage.setItem(STORAGE_KEY, JSON.stringify(apiNode));
};

type ApiNodes = ApiNode[];
type Client = ReturnType<typeof createClient>;
type EnvState = {
  nodes: ApiNodes;
  status: 'default' | 'pending' | 'success' | 'failed';
  error: string | null;
};
type Actions = {
  setApiNode: (apiNode: ApiNode) => void;
  initialize: () => Promise<void>;
};
export type Env = Environment & EnvState;
export type EnvStore = Env & Actions;

const QUERY_TIMEOUT = 3000;
const SUBSCRIPTION_TIMEOUT = 3000;

const raceAgainst = (timeout: number): Promise<false> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, timeout);
  });

/**
 * Fetch and validate a vega node configuration,
 * this will return only the hosts that have both GraphQL and REST endpoints
 * configured.
 */
const fetchConfig = async (url?: string): Promise<ApiNode[]> => {
  if (!url) return [];
  const res = await fetch(url);
  const content = await res.text();
  const parsed = tomlParse(content);
  const tomlResults = tomlConfigSchema.parse(parsed);
  const {
    API: {
      GraphQL: { Hosts: gqlHosts },
      REST: { Hosts: restHosts },
    },
  } = tomlResults;

  const gs = gqlHosts.map((u) => new URL(u));
  const rs = restHosts.map((u) => new URL(u));

  const hosts: ApiNode[] = compact(
    gs.map((u) => {
      const restApiUrl = rs.find((r) => r.host === u.host);
      if (!restApiUrl) return undefined;
      return { graphQLApiUrl: u.toString(), restApiUrl: restApiUrl.toString() };
    })
  );

  return hosts;
};

/**
 * Find a suitable nodes by running a test query and test
 * subscription, against a list of clients, first to resolve wins
 */
const findHealthyNodes = async (apiNodes: ApiNode[]) => {
  const clients = apiNodes.map((apiNode) => {
    return {
      apiNode,
      apolloClient: createClient({
        url: apiNode.graphQLApiUrl,
        cacheConfig: undefined,
        retry: false,
        connectToDevTools: false,
      }),
    };
  });

  const tests = clients.map(({ apiNode, apolloClient }) =>
    testNode(apolloClient, apiNode)
  );
  try {
    const nodes = await Promise.all(tests);
    const responsiveNodes = nodes
      .filter(([, q, s, r]) => q && s && r)
      .map(([apiNode, q]) => {
        return {
          apiNode,
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
  ApiNode,
  Maybe<QueryTestResult>,
  Maybe<SubscriptionTestResult>,
  Maybe<boolean>
];
/**
 * Test a node for suitability for connection
 */
const testNode = async (
  client: Client,
  apiNode: ApiNode
): Promise<NodeTestResult> => {
  const results = await Promise.all([
    testQuery(client, apiNode),
    testSubscription(client),
    testRestApi(apiNode),
  ]);
  return [apiNode, ...results];
};

/**
 * Run a test query on a client
 */
const testQuery = (
  client: Client,
  apiNode: ApiNode
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
            responseTime: canMeasureResponseTime(apiNode.graphQLApiUrl)
              ? measureResponseTime(apiNode.graphQLApiUrl) || Infinity
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

const testRestApi = async (apiNode: ApiNode) => {
  const nodeInfoSchema = z.object({
    commitHash: z.string(),
    version: z.string(),
  });
  const nodeInfoUrl = `${trimEnd(apiNode.restApiUrl, '/')}/api/v2/info`;

  try {
    const res = await fetch(nodeInfoUrl);
    if (res.ok) {
      const json = await res.json();
      nodeInfoSchema.parse(json);
      return true;
    }
  } catch {
    // NOOP
  }

  return false;
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

  let apiNode = getStoredApiNode();
  const isApiNodeValid =
    apiNode &&
    isValidUrl(apiNode.graphQLApiUrl) &&
    isValidUrl(apiNode.restApiUrl);
  if (!isApiNodeValid) {
    const an = windowOrDefault(
      'API_NODE',
      process.env['NX_API_NODE'] as string
    );
    apiNode = storedApiNodeSchema.parse(an);
    LocalStorage.removeItem(STORAGE_KEY);
  }

  const env: Environment = {
    API_NODE: apiNode,
    VEGA_ENV,
    VEGA_CONFIG_URL: windowOrDefault(
      'VEGA_CONFIG_URL',
      process.env['NX_VEGA_CONFIG_URL'] as string
    ),
    APP_NAME: windowOrDefault('NX_APP_NAME', process.env['NX_APP_NAME']),
    VEGA_NETWORKS: parseJson(
      windowOrDefault('VEGA_NETWORKS', process.env['NX_VEGA_NETWORKS'])
    ),
    CONFIGURED_WALLETS: parseJson(
      windowOrDefault(
        'CONFIGURED_WALLETS',
        process.env['NX_CONFIGURED_WALLETS']
      )
    ),
    VEGA_WALLET_URL: windowOrDefault(
      'VEGA_WALLET_URL',
      process.env['NX_VEGA_WALLET_URL'] as string
    ),
    ETHERSCAN_URL: getEtherscanUrl(
      VEGA_ENV,
      windowOrDefault('ETHERSCAN_URL', process.env['NX_ETHERSCAN_URL'])
    ),
    ETHEREUM_PROVIDER_URL: getEthereumProviderUrl(
      VEGA_ENV,
      windowOrDefault(
        'ETHEREUM_PROVIDER_URL',
        process.env['NX_ETHEREUM_PROVIDER_URL']
      )
    ),
    ETH_LOCAL_PROVIDER_URL: windowOrDefault(
      'ETH_LOCAL_PROVIDER_URL',
      process.env['NX_ETH_LOCAL_PROVIDER_URL']
    ),
    ETH_WALLET_MNEMONIC: windowOrDefault(
      'ETH_WALLET_MNEMONIC',
      process.env['NX_ETH_WALLET_MNEMONIC']
    ),
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
    APP_VERSION: windowOrDefault('APP_VERSION', process.env['NX_APP_VERSION']),
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
      process.env['NX_CHARTING_LIBRARY_PATH']
    ),
    CHARTING_LIBRARY_HASH: windowOrDefault(
      'NX_CHARTING_LIBRARY_HASH',
      process.env['NX_CHARTING_LIBRARY_HASH']
    ),
    SQUID_INTEGRATOR_ID: windowOrDefault(
      'NX_SQUID_INTEGRATOR_ID',
      process.env['NX_SQUID_INTEGRATOR_ID']
    ),
    SQUID_API_URL: windowOrDefault(
      'NX_SQUID_API_URL',
      process.env['NX_SQUID_API_URL']
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
  const TRADING_FLAGS = {
    TWAP_REWARDS: TRUTHY.includes(
      windowOrDefault(
        'NX_TWAP_REWARDS',
        process.env['NX_TWAP_REWARDS']
      ) as string
    ),
    DISABLE_CLOSE_POSITION: TRUTHY.includes(
      windowOrDefault(
        'NX_DISABLE_CLOSE_POSITION',
        process.env['NX_DISABLE_CLOSE_POSITION']
      ) as string
    ),
    ENABLE_AMM: TRUTHY.includes(
      windowOrDefault('NX_ENABLE_AMM', process.env['NX_ENABLE_AMM']) as string
    ),
    ENABLE_HOMEPAGE: TRUTHY.includes(
      windowOrDefault(
        'NX_ENABLE_HOMEPAGE',
        process.env['NX_ENABLE_HOMEPAGE']
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

  const EXPERIMENTAL_FLAGS = {};

  const flags = {
    ...TRADING_FLAGS,
    ...EXPLORER_FLAGS,
    ...GOVERNANCE_FLAGS,
    ...EXPERIMENTAL_FLAGS,
  };
  getUserEnabledFeatureFlags(refresh).forEach((flag) => (flags[flag] = true));
  return flags;
};

const parseJson = (value?: string) => {
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
const getEthereumProviderUrl = (
  network: Networks | undefined,
  envvar: string | undefined
) => {
  if (envvar) return envvar;
  return network === Networks.MAINNET
    ? 'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'
    : 'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8';
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
  setApiNode: (apiNode: ApiNode) => {
    set({ API_NODE: apiNode, status: 'success', error: null });
    storeApiNode(apiNode);
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

    // Set the node url if available, but then continue with
    // getting node config
    if (
      state.API_NODE &&
      isValidUrl(state.API_NODE.graphQLApiUrl) &&
      isValidUrl(state.API_NODE.restApiUrl)
    ) {
      state.setApiNode(state.API_NODE);
    }

    // Start fetching nodes in the background
    let nodes: ApiNode[] = [];

    try {
      nodes = uniqBy(
        compact([
          // url from state (if set via env var)
          state.API_NODE,
          // urls from network configuration
          ...(await fetchConfig(state.VEGA_CONFIG_URL)),
        ]),
        (apiNode) => `${apiNode.graphQLApiUrl}+${apiNode.restApiUrl}`
      );

      set({ nodes });
    } catch (err) {
      console.warn(`Could not fetch node config from ${state.VEGA_CONFIG_URL}`);
    }

    // We have a node and nodes have been fetched for the network switcher
    if (state.API_NODE) {
      return;
    }

    // No url found in env vars or localStorage, AND no nodes were found in
    // the config fetched from VEGA_CONFIG_URL, app initialization has failed
    if (!nodes.length) {
      set({
        status: 'failed',
        error: `Failed to fetch node config from ${state.VEGA_CONFIG_URL}`,
      });
      return;
    }

    // Not node set yet, determine the healthiest node
    const healthyNodes = await findHealthyNodes(nodes);
    const bestNode = first(healthyNodes);
    if (bestNode) {
      state.setApiNode(bestNode.apiNode);
      return;
    }

    // Could not find a health node, all failed
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
 * in those cases be sure to set NX_API_NODE
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
