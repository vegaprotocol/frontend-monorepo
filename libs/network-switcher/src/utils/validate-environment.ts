import Ajv from 'ajv';
import compileErrors from 'better-ajv-errors';
import type { Environment} from '../types';
import { ENV_KEYS } from '../types';

const ajv = new Ajv({ allErrors: true });

const baseProps = {
  VEGA_ENV: {
    type: 'string',
  },
  VEGA_NETWORKS: {
    type: 'object',
    properties: {
      MAINNET: {
        type: 'string',
      },
      TESTNET: {
        type: 'string',
      },
      DEVNET: {
        type: 'string',
      },
      STAGNET: {
        type: 'string',
      },
      STAGNET2: {
        type: 'string',
      },
    },
  },
  ETHEREUM_CHAIN_ID: {
    type: 'integer',
  },
  ETHEREUM_PROVIDER_URL: {
    type: 'string',
  },
  ETHERSCAN_URL: {
    type: 'string',
  },
  ADDRESSES: {
    type: 'object',
    required: [
      'vegaTokenAddress',
      'claimAddress',
      'lockedAddress',
      'vestingAddress',
      'stakingBridge',
      'erc20Bridge',
    ],
    properties: {
      vegaTokenAddress: {
        type: 'string',
      },
      claimAddress: {
        type: 'string',
      },
      lockedAddress: {
        type: 'string',
      },
      vestingAddress: {
        type: 'string',
      },
      stakingBridge: {
        type: 'string',
      },
      erc20Bridge: {
        type: 'string',
      },
    },
  },
};

const schema = {
  type: 'object',
  oneOf: [
    {
      // config url is not needed when there's an explicit vega url provided
      required: ENV_KEYS.filter((key) => key !== 'VEGA_CONFIG_URL'),
      additionalProperties: false,
      properties: {
        ...baseProps,
        VEGA_URL: {
          type: 'string',
        },
      },
    },
    {
      // vega url is not needed when there's a config url provided
      required: ENV_KEYS.filter((key) => key !== 'VEGA_URL'),
      additionalProperties: false,
      properties: {
        ...baseProps,
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

const validate = ajv.compile(schema);

export const validateEnvironment = (
  environment: Environment
): string | undefined => {
  const isValid = validate(environment);

  if (!isValid && validate.errors) {
    return compileErrors(schema, environment, validate.errors);
  }

  return undefined;
};
