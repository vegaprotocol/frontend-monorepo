import z from 'zod';

export enum Networks {
  VALIDATOR_TESTNET = 'VALIDATOR_TESTNET',
  CUSTOM = 'CUSTOM',
  SANDBOX = 'SANDBOX',
  TESTNET = 'TESTNET',
  STAGNET1 = 'STAGNET1',
  STAGNET3 = 'STAGNET3',
  DEVNET = 'DEVNET',
  MAINNET = 'MAINNET',
  MIRROR = 'MIRROR',
}

const schemaObject = {
  VEGA_URL: z.optional(z.string()),
  VEGA_WALLET_URL: z.optional(z.string()),
  VEGA_CONFIG_URL: z.optional(z.string()),
  GIT_BRANCH: z.optional(z.string()),
  GIT_COMMIT_HASH: z.optional(z.string()),
  GIT_ORIGIN_URL: z.optional(z.string()),
  GITHUB_FEEDBACK_URL: z.optional(z.string()),
  VEGA_ENV: z.nativeEnum(Networks),
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
};

// combine schema above with custom rule to ensure either
// VEGA_URL or VEGA_CONFIG_URL are provided
export const envSchema = z.object(schemaObject).refine(
  (data) => {
    return !(!data.VEGA_URL && !data.VEGA_CONFIG_URL);
  },
  {
    message:
      'Must provide either NX_VEGA_CONFIG_URL or NX_VEGA_URL in the environment.',
  }
);
