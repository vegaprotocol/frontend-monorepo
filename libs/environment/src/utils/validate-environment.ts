import z from 'zod';

export enum Networks {
  VALIDATOR_TESTNET = 'VALIDATOR_TESTNET',
  MAINNET_MIRROR = 'MAINNET_MIRROR',
  CUSTOM = 'CUSTOM',
  TESTNET = 'TESTNET',
  STAGNET1 = 'STAGNET1',
  DEVNET = 'DEVNET',
  MAINNET = 'MAINNET',
}

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
    MAINTENANCE_PAGE: z.optional(z.boolean()),
    ETH_LOCAL_PROVIDER_URL: z.optional(z.string()),
    ETH_WALLET_MNEMONIC: z.optional(z.string()),
    ANNOUNCEMENTS_CONFIG_URL: z.optional(z.string()),
    VEGA_INCIDENT_URL: z.optional(z.string()),
    APP_VERSION: z.optional(z.string()),
    SENTRY_DSN: z.optional(z.string()),
    TENDERMINT_URL: z.optional(z.string()),
    TENDERMINT_WEBSOCKET_URL: z.optional(z.string()),
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

export const featureFlagsSchema = z.object({
  CONSOLE_SUCCESSOR_MARKETS: z.optional(z.boolean()),
  CONSOLE_STOP_ORDERS: z.optional(z.boolean()),
  CONSOLE_ICEBERG_ORDERS: z.optional(z.boolean()),
  CONSOLE_PRODUCT_PERPETUALS: z.optional(z.boolean()),
});
