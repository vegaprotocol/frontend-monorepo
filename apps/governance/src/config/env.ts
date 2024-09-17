import type { Networks } from '@vegaprotocol/environment';

const windowOrDefault = (key: string) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  return process.env[key] || '';
};

const TRUTHY = ['1', 'true'];

interface VegaContracts {
  claimAddress: string;
  lockedAddress: string;
}

const customClaimAddress = process.env['NX_CUSTOM_CLAIM_ADDRESS'] as string;
const customLockedAddress = process.env['NX_CUSTOM_LOCKED_ADDRESS'] as string;

export const ContractAddresses: {
  [key in Networks | 'CUSTOM']: VegaContracts;
} = {
  CUSTOM: {
    claimAddress: customClaimAddress ?? '0x0',
    lockedAddress: customLockedAddress ?? '0x0',
  },
  MAINNET_MIRROR: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  DEVNET: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  STAGNET1: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  TESTNET: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  VALIDATORS_TESTNET: {
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  MAINNET: {
    claimAddress: '0x0ee1fb382caf98e86e97e51f9f42f8b4654020f3',
    lockedAddress: '0x78344c7305d73a7a0ac3c94cd9960f4449a1814e',
  },
};

const envName = windowOrDefault('NX_VEGA_ENV') ?? 'local';

export const ENV = {
  // Environment
  tranchesServiceUrl: windowOrDefault('NX_TRANCHES_SERVICE_URL'),
  urlConnect: TRUTHY.includes(windowOrDefault('NX_ETH_URL_CONNECT')),
  explorerUrl: windowOrDefault('NX_VEGA_EXPLORER'),
  docsUrl: windowOrDefault('NX_VEGA_DOCS_URL'),
  ethWalletMnemonic: windowOrDefault('NX_ETH_WALLET_MNEMONIC'),
  localProviderUrl: windowOrDefault('NX_LOCAL_PROVIDER_URL'),
  rest: windowOrDefault('NX_VEGA_REST_URL'),
  addresses:
    ContractAddresses[(envName === 'local' ? 'CUSTOM' : envName) as Networks],
};
