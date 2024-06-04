import z from 'zod';
import { Networks } from '../types';

// combine schema above with custom rule to ensure either
// VEGA_URL or VEGA_CONFIG_URL are provided
export const envSchema = z
  .object({
    VEGA_URL: z.optional(z.string()),
    VEGA_WALLET_URL: z.optional(z.string()),
    VEGA_CONFIG_URL: z.optional(z.string()),
    GIT_BRANCH: z.optional(z.string()),
    GIT_COMMIT_HASH: z.optional(z.string()),
    GIT_ORIGIN_URL: z.optional(z.string()),
    GITHUB_FEEDBACK_URL: z.optional(z.string()),
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
      return !(!data.VEGA_URL && !data.VEGA_CONFIG_URL);
    },
    {
      message:
        'Must provide either NX_VEGA_CONFIG_URL or NX_VEGA_URL in the environment.',
    }
  );

const COSMIC_ELEVATOR_FLAGS = {
  SUCCESSOR_MARKETS: z.optional(z.boolean()),
  STOP_ORDERS: z.optional(z.boolean()),
  TAKE_PROFIT_STOP_LOSS: z.optional(z.boolean()),
  SWAP: z.optional(z.boolean()),
  TWAP_REWARDS: z.optional(z.boolean()),
  ISOLATED_MARGIN: z.optional(z.boolean()),
  ICEBERG_ORDERS: z.optional(z.boolean()),
  PRODUCT_PERPETUALS: z.optional(z.boolean()),
  METAMASK_SNAPS: z.optional(z.boolean()),
  REFERRALS: z.optional(z.boolean()),
  UPDATE_MARKET_STATE: z.optional(z.boolean()),
  GOVERNANCE_TRANSFERS: z.optional(z.boolean()),
  VOLUME_DISCOUNTS: z.optional(z.boolean()),
  DISABLE_CLOSE_POSITION: z.optional(z.boolean()),
  TEAM_COMPETITION: z.optional(z.boolean()),
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
  CROSS_CHAIN_DEPOSITS_ENABLED: z.optional(z.boolean()),
  CROSS_CHAIN_DEPOSITS: z.optional(z.boolean()),
  CROSS_CHAIN_DEPOSITS_TEST: z.optional(z.boolean()),
};

export const featureFlagsSchema = z.object({
  ...COSMIC_ELEVATOR_FLAGS,
  ...EXPLORER_FLAGS,
  ...GOVERNANCE_FLAGS,
  ...EXPERIMENTAL_FLAGS,
});
