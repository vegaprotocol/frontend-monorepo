import z from 'zod';
import { Networks } from '../types';

/**
 * Creates a URL to the GrapQL API.
 * Conventionally the GQL pathname is `/graphql`
 */
const createGraphQLApiUrl = (url: string) => {
  const u = new URL(url);
  u.pathname = 'graphql';
  return u.toString();
};

/**
 * Create a URL to the REST API.
 * Conventionally the REST API pathname is empty.
 */
const createRestApiUrl = (url: string) => {
  const u = new URL(url);
  u.pathname = '';
  return u.toString();
};

export const apiNodeSchema = z.object({
  graphQLApiUrl: z.string(),
  restApiUrl: z.string(),
});

/**
 * Transforms a URL into the `ApiNode` as per the URL conventions.
 * Example:
 *  Input: `"https://api.n00.data-node.vega.dev:1234/"`
 *  Output: ```
 *    {
 *      graphQLApiUrl: "https://api.n00.data-node.vega.dev:1234/graphql",
 *      restApiUrl: "https://api.n00.data-node.vega.dev:1234/"
 *    }
 *  ```
 */
export const createApiNode = (value: string | null | undefined) => {
  if (value) {
    try {
      const apiNode = apiNodeSchema.parse({
        graphQLApiUrl: createGraphQLApiUrl(value),
        restApiUrl: createRestApiUrl(value),
      });
      return apiNode;
    } catch {
      // NOOP
    }
  }
  return undefined;
};

export const storedApiNodeSchema = z
  .string()
  .optional()
  .nullable()
  .transform(createApiNode);
export type ApiNode = z.infer<typeof apiNodeSchema>;

// combine schema above with custom rule to ensure either
// API_NODE or VEGA_CONFIG_URL are provided
export const envSchema = z
  .object({
    API_NODE: z.optional(apiNodeSchema),
    VEGA_WALLET_URL: z.optional(z.string()),
    VEGA_CONFIG_URL: z.optional(z.string()),
    GIT_BRANCH: z.optional(z.string()),
    GIT_COMMIT_HASH: z.optional(z.string()),
    GIT_ORIGIN_URL: z.optional(z.string()),
    ORACLE_PROOFS_URL: z.optional(z.string().url()),
    VEGA_ENV: z.nativeEnum(Networks),
    VEGA_CONSOLE_URL: z.optional(z.string()),
    VEGA_EXPLORER_URL: z.optional(z.string()),
    VEGA_TOKEN_URL: z.optional(z.string()),
    VEGA_DOCS_URL: z.optional(z.string()),
    VEGA_NETWORKS: z
      .object(
        Object.keys(Networks).reduce(
          (acc, env) => ({
            ...acc,
            [env]: z.optional(z.string()),
          }),
          {}
        ) as Record<Networks, z.ZodOptional<z.ZodString>>
      )
      .strict({
        message: `All keys in NX_VEGA_NETWORKS must represent a valid environment: ${Object.keys(
          Networks
        ).join(' | ')}`,
      }),
    ETHEREUM_PROVIDER_URL: z.string().url({
      message:
        'The NX_ETHEREUM_PROVIDER_URL environment variable must be a valid url',
    }),
    ETHERSCAN_URL: z.string().url({
      message: 'The NX_ETHERSCAN_URL environment variable must be a valid url',
    }),
    HOSTED_WALLET_URL: z.optional(z.string()),
    ETH_LOCAL_PROVIDER_URL: z.optional(z.string()),
    ETH_WALLET_MNEMONIC: z.optional(z.string()),
    ANNOUNCEMENTS_CONFIG_URL: z.optional(z.string()),
    VEGA_INCIDENT_URL: z.optional(z.string()),
    APP_VERSION: z.optional(z.string()),
    SENTRY_DSN: z.optional(z.string()),
    TENDERMINT_URL: z.optional(z.string()),
    TENDERMINT_WEBSOCKET_URL: z.optional(z.string()),
    CHROME_EXTENSION_URL: z.optional(z.string()),
    MOZILLA_EXTENSION_URL: z.optional(z.string()),
    CHARTING_LIBRARY_PATH: z.optional(z.string()),
    CHARTING_LIBRARY_HASH: z.optional(z.string()),
    SQUID_INTEGRATOR_ID: z.optional(z.string()),
    SQUID_API_URL: z.optional(z.string()),
  })
  .refine(
    (data) => {
      return !(!data.API_NODE && !data.VEGA_CONFIG_URL);
    },
    {
      message:
        'Must provide either NX_VEGA_CONFIG_URL or NX_API_NODE in the environment.',
    }
  );

const COSMIC_ELEVATOR_FLAGS = {
  STOP_ORDERS: z.optional(z.boolean()), // not needed
  TAKE_PROFIT_STOP_LOSS: z.optional(z.boolean()), // not needed
  SWAP: z.optional(z.boolean()), // not needed
  TWAP_REWARDS: z.optional(z.boolean()), // this is disables currently
  ISOLATED_MARGIN: z.optional(z.boolean()), // ?
  ICEBERG_ORDERS: z.optional(z.boolean()), // not needed
  PRODUCT_PERPETUALS: z.optional(z.boolean()), // not needed
  METAMASK_SNAPS: z.optional(z.boolean()), // not needed
  UPDATE_MARKET_STATE: z.optional(z.boolean()), // not needed
  GOVERNANCE_TRANSFERS: z.optional(z.boolean()), // not needed
  DISABLE_CLOSE_POSITION: z.optional(z.boolean()),
  ENABLE_HOMEPAGE: z.optional(z.boolean()),
};

const EXPLORER_FLAGS = {
  EXPLORER_ASSETS: z.optional(z.boolean()),
  EXPLORER_GENESIS: z.optional(z.boolean()),
  EXPLORER_GOVERNANCE: z.optional(z.boolean()),
  EXPLORER_NETWORK_PARAMETERS: z.optional(z.boolean()),
  EXPLORER_PARTIES: z.optional(z.boolean()),
  EXPLORER_VALIDATORS: z.optional(z.boolean()),
  EXPLORER_MARKETS: z.optional(z.boolean()),
  EXPLORER_ORACLES: z.optional(z.boolean()),
  EXPLORER_TXS_LIST: z.optional(z.boolean()),
};

const GOVERNANCE_FLAGS = {
  GOVERNANCE_NETWORK_DOWN: z.optional(z.boolean()),
  GOVERNANCE_NETWORK_LIMITS: z.optional(z.boolean()),
};

const EXPERIMENTAL_FLAGS = {
  CROSS_CHAIN_DEPOSITS_ENABLED: z.optional(z.boolean()), // not needed
  CROSS_CHAIN_DEPOSITS_TEST: z.optional(z.boolean()), // not needed
  IN_BROWSER_WALLET: z.optional(z.boolean()),
};

export const featureFlagsSchema = z.object({
  ...COSMIC_ELEVATOR_FLAGS,
  ...EXPLORER_FLAGS,
  ...GOVERNANCE_FLAGS,
  ...EXPERIMENTAL_FLAGS,
});
