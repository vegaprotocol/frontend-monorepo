export enum Networks {
  CUSTOM = 'CUSTOM',
  TESTNET = 'TESTNET',
  STAGNET = 'STAGNET',
  STAGNET2 = 'STAGNET2',
  DEVNET = 'DEVNET',
  MAINNET = 'MAINNET',
}

export type Environment = {
  VEGA_URL: string;
  VEGA_ENV: Networks;
  VEGA_CONFIG_URL: string;
  VEGA_NETWORKS: Partial<Record<Networks, string>>;
  ETHEREUM_PROVIDER_URL: string;
  ETHERSCAN_URL: string;
};

export const ENV_KEYS = [
  'VEGA_URL',
  'VEGA_ENV',
  'VEGA_CONFIG_URL',
  'VEGA_NETWORKS',
  'ETHEREUM_PROVIDER_URL',
  'ETHERSCAN_URL',
] as const;

export type EnvKey = typeof ENV_KEYS[number];

export type RawEnvironment = Record<EnvKey, string>;

export type Configuration = {
  hosts: string[];
};

export type ConfigStatus =
  | 'idle'
  | 'success'
  | 'loading-config'
  | 'loading-node'
  | 'error-loading-config'
  | 'error-validating-config'
  | 'error-loading-node';
