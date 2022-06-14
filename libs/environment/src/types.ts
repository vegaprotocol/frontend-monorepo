import { Networks } from '@vegaprotocol/react-helpers';

export type Environment = {
  VEGA_URL: string;
  VEGA_ENV: Networks;
  VEGA_CONFIG_URL: string;
  VEGA_NETWORKS: Partial<Record<Networks, string>>;
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

const customClaimAddress = process.env['CUSTOM_CLAIM_ADDRESS'] as string;
const customLockedAddress = process.env['CUSTOM_LOCKED_ADDRESS'] as string;
interface VegaContracts {
  claimAddress: string;
  lockedAddress: string;
}

export const ContractAddresses: { [key in Networks | 'CUSTOM']: VegaContracts } = {
  CUSTOM: {
    claimAddress: customClaimAddress,
    lockedAddress: customLockedAddress,
  },
  DEVNET: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994',
    lockedAddress: '0x0',
  },
  STAGNET: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  STAGNET2: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  TESTNET: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  MAINNET: {
    claimAddress: '0x0ee1fb382caf98e86e97e51f9f42f8b4654020f3',
    lockedAddress: '0x78344c7305d73a7a0ac3c94cd9960f4449a1814e',
  },
};
