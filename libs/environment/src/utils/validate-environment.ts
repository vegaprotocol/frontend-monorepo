import Ajv from 'ajv';
import compileErrors from 'better-ajv-errors';
import type { Environment } from '../types';
import { Networks, ENV_KEYS } from '../types';

const ajv = new Ajv({ allErrors: true });

const envSchema = {
  type: 'object',
  additionalProperties: false,
  required: ENV_KEYS.filter(
    (key) => !['VEGA_URL', 'VEGA_CONFIG_URL'].includes(key)
  ),
  properties: {
    VEGA_ENV: {
      type: 'string',
      enum: Object.values(Networks),
    },
    VEGA_NETWORKS: {
      type: 'object',
      additionalProperties: false,
      properties: Object.values(Networks).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            type: 'string',
          },
        }),
        { CUSTOM: { type: 'string' } }
      ),
    },
    ETHEREUM_PROVIDER_URL: {
      type: 'string',
    },
    ETHERSCAN_URL: {
      type: 'string',
    },
  },
};

const connectionSchema = {
  type: 'object',
  anyOf: [
    {
      // config url is not needed when there's an explicit vega url provided
      additionalProperties: false,
      required: ['VEGA_URL', 'VEGA_CONFIG_URL'],
      properties: {
        VEGA_URL: {
          type: 'string',
        },
        VEGA_CONFIG_URL: {
          type: ['string', 'null'],
        },
      },
    },
    {
      // vega url is optional when there's a config url provided
      additionalProperties: false,
      required: ['VEGA_URL', 'VEGA_CONFIG_URL'],
      properties: {
        VEGA_URL: {
          type: ['string', 'null'],
        },
        VEGA_CONFIG_URL: {
          type: 'string',
        },
      },
    },
  ],
};

const validateEnv = ajv.compile(envSchema);
const validateConnection = ajv.compile(connectionSchema);

export const validateEnvironment = (
  environment: Environment
): string | undefined => {
  const { VEGA_URL, VEGA_CONFIG_URL, ...rest } = environment;

  const isValidEnv = validateEnv(rest);
  const hasValidConnectionConfig = validateConnection({
    VEGA_URL: VEGA_URL ?? null,
    VEGA_CONFIG_URL: VEGA_CONFIG_URL ?? null,
  });

  if (!isValidEnv && validateEnv.errors) {
    return compileErrors(envSchema, environment, validateEnv.errors, {
      indent: 2,
    });
  }

  if (!hasValidConnectionConfig && validateConnection.errors) {
    return compileErrors(
      connectionSchema,
      environment,
      validateConnection.errors,
      { indent: 2 }
    );
  }

  return undefined;
};
