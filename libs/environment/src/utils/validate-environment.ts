import type { ZodIssue } from 'zod';
import z from 'zod';
import type { Environment } from '../types';
import { compileErrors } from './compile-errors';

export enum Networks {
  CUSTOM = 'CUSTOM',
  TESTNET = 'TESTNET',
  STAGNET = 'STAGNET',
  STAGNET2 = 'STAGNET2',
  DEVNET = 'DEVNET',
  MAINNET = 'MAINNET',
}

const schemaObject = {
  VEGA_URL: z.optional(z.string()),
  VEGA_CONFIG_URL: z.optional(z.string()),
  GIT_BRANCH: z.optional(z.string()),
  GIT_COMMIT_HASH: z.optional(z.string()),
  GIT_ORIGIN_URL: z.optional(z.string()),
  GITHUB_FEEDBACK_URL: z.optional(z.string()),
  VEGA_ENV: z.nativeEnum(Networks),
  VEGA_EXPLORER_URL: z.optional(z.string()),
  VEGA_NETWORKS: z
    .object(
      Object.keys(Networks).reduce(
        (acc, env) => ({
          ...acc,
          [env]: z.optional(z.string()),
        }),
        {}
      )
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
};

export const ENV_KEYS = Object.keys(schemaObject) as Array<
  keyof typeof schemaObject
>;

const compileIssue = (issue: ZodIssue) => {
  switch (issue.code) {
    case 'invalid_type':
      return `NX_${issue.path[0]} is invalid, received "${issue.received}" instead of: ${issue.expected}`;
    case 'invalid_enum_value':
      return `NX_${issue.path[0]} is invalid, received "${
        issue.received
      }" instead of: ${issue.options.join(' | ')}`;
    default:
      return issue.message;
  }
};

export const envSchema = z.object(schemaObject).refine(
  (data) => {
    return !(!data.VEGA_URL && !data.VEGA_CONFIG_URL);
  },
  {
    message:
      'Must provide either NX_VEGA_CONFIG_URL or NX_VEGA_URL in the environment.',
  }
);

export const validateEnvironment = (
  environment: Environment
): string | undefined => {
  try {
    envSchema.parse(environment);
    return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return compileErrors(
      'Error processing the vega app environment',
      err,
      compileIssue
    );
  }
};
