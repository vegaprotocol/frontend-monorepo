import type {
  EnvironmentConfig,
  Networks,
} from '@vegaprotocol/smart-contracts';

type VegaContracts = typeof EnvironmentConfig[Networks];

export type Environment = {
  VEGA_URL: string;
  VEGA_ENV: Networks;
  VEGA_CONFIG_URL: string;
  VEGA_NETWORKS: Record<Networks, string>;
  ETHEREUM_CHAIN_ID: number;
  ETHEREUM_PROVIDER_URL: string;
  ETHERSCAN_URL: string;
  ADDRESSES: VegaContracts;
};

export const ENV_KEYS = [
  'VEGA_URL',
  'VEGA_ENV',
  'VEGA_CONFIG_URL',
  'VEGA_NETWORKS',
  'ETHEREUM_CHAIN_ID',
  'ETHEREUM_PROVIDER_URL',
  'ETHERSCAN_URL',
] as const;

export type EnvKey = typeof ENV_KEYS[number];

export type RawEnvironment = Record<EnvKey, string>;

export type ConfigStatus =
  | 'idle'
  | 'success'
  | 'loading-config'
  | 'loading-node'
  | 'error-loading-config'
  | 'error-loading-node';
