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

const customClaimAddress = process.env['CUSTOM_CLAIM_ADDRESS'] as string;
const customLockedAddress = process.env['CUSTOM_LOCKED_ADDRESS'] as string;

export const ContractAddresses: {
  [key in Networks | 'CUSTOM']: VegaContracts;
} = {
  CUSTOM: {
    claimAddress: customClaimAddress ?? '0x0',
    lockedAddress: customLockedAddress ?? '0x0',
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

const envName = windowOrDefault('NX_VEGA_ENV') ?? 'local';

export const ENV = {
  // Environment
  dsn: windowOrDefault('NX_SENTRY_DSN'),
  envName,
  commit: windowOrDefault('NX_COMMIT_REF'),
  branch: windowOrDefault('NX_BRANCH'),
  vegaUrl: windowOrDefault('NX_VEGA_URL'),
  flags: {
    NETWORK_DOWN: TRUTHY.includes(windowOrDefault('NX_NETWORK_DOWN')),
    HOSTED_WALLET_ENABLED: TRUTHY.includes(
      windowOrDefault('NX_HOSTED_WALLET_ENABLED')
    ),
    MOCK: TRUTHY.includes(windowOrDefault('NX_MOCKED')),
    FAIRGROUND: TRUTHY.includes(windowOrDefault('NX_FAIRGROUND')),
    NETWORK_LIMITS: TRUTHY.includes(windowOrDefault('NX_NETWORK_LIMITS')),
    USE_NEW_BRIDGE_CONTRACT: TRUTHY.includes(
      process.env['NX_IS_NEW_BRIDGE_CONTRACT'] as string
    ),
  },
  addresses:
    ContractAddresses[(envName === 'local' ? 'CUSTOM' : envName) as Networks],
};
