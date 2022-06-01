import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Networks } from '../lib/environment';

declare global {
  interface Window {
    _ENV?: RawEnvironment;
  }
}
const customVegaTokenAddress = process.env['CUSTOM_TOKEN_ADDRESS'] as string;
const customClaimAddress = process.env['CUSTOM_CLAIM_ADDRESS'] as string;
const customLockedAddress = process.env['CUSTOM_LOCKED_ADDRESS'] as string;
interface VegaContracts {
  vegaTokenAddress: string;
  claimAddress: string;
  lockedAddress: string;
}

export const ContractAddresses: { [key in Networks]: VegaContracts } = {
  CUSTOM: {
    vegaTokenAddress: customVegaTokenAddress,
    claimAddress: customClaimAddress,
    lockedAddress: customLockedAddress,
  },
  DEVNET: {
    vegaTokenAddress: '0xc93137f9F4B820Ca85FfA3C7e84cCa6Ebc7bB517',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994',
    lockedAddress: '0x0',
  },
  STAGNET: {
    vegaTokenAddress: '0x547cbA83a7eb82b546ee5C7ff0527F258Ba4546D',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  STAGNET2: {
    vegaTokenAddress: '0xd8fa193B93a179DdCf51FFFDe5320E0872cdcf44',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  TESTNET: {
    vegaTokenAddress: '0xDc335304979D378255015c33AbFf09B60c31EBAb',
    claimAddress: '0x8Cef746ab7C83B61F6461cC92882bD61AB65a994', // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: '0x0', // TODO not deployed to this env
  },
  MAINNET: {
    vegaTokenAddress: '0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e',
    claimAddress: '0x0ee1fb382caf98e86e97e51f9f42f8b4654020f3',
    lockedAddress: '0x78344c7305d73a7a0ac3c94cd9960f4449a1814e',
  },
};

type EnvironmentProviderProps = {
  definintions?: Partial<RawEnvironment>;
  children?: ReactNode;
};

export const ENV_KEYS = [
  'VEGA_URL',
  'VEGA_ENV',
  'ETHEREUM_CHAIN_ID',
  'ETHEREUM_PROVIDER_URL',
  'ETHERSCAN_URL',
] as const;

type EnvKey = typeof ENV_KEYS[number];

type RawEnvironment = Record<EnvKey, string>;

export type Environment = {
  VEGA_URL: string;
  VEGA_ENV: Networks;
  ETHEREUM_CHAIN_ID: number;
  ETHEREUM_PROVIDER_URL: string;
  ETHERSCAN_URL: string;
  ADDRESSES: VegaContracts;
};

const getBundledEnvironmentValue = (key: EnvKey) => {
  switch (key) {
    // need to have these hardcoded so on build time we can insert sensible defaults
    case 'VEGA_URL':
      return process.env['NX_VEGA_URL'];
    case 'VEGA_ENV':
      return process.env['NX_VEGA_ENV'];
    case 'ETHEREUM_CHAIN_ID':
      return process.env['NX_ETHEREUM_CHAIN_ID'];
    case 'ETHEREUM_PROVIDER_URL':
      return process.env['NX_ETHEREUM_PROVIDER_URL'];
    case 'ETHERSCAN_URL':
      return process.env['NX_ETHERSCAN_URL'];
  }
};

const transformValue = (key: EnvKey, value?: string) => {
  switch (key) {
    case 'VEGA_ENV':
      return value as Networks;
    case 'ETHEREUM_CHAIN_ID':
      return value && Number(value);
    default:
      return value;
  }
};

const getValue = (key: EnvKey, definintions: Partial<RawEnvironment> = {}) => {
  if (typeof window === 'undefined') {
    return transformValue(
      key,
      definintions[key] ?? getBundledEnvironmentValue(key)
    );
  }
  return transformValue(
    key,
    window._ENV?.[key] ?? definintions[key] ?? getBundledEnvironmentValue(key)
  );
};

const EnvironmentContext = createContext({} as Environment);

export const EnvironmentProvider = ({
  definintions,
  children,
}: EnvironmentProviderProps) => {
  const environment = ENV_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: getValue(key, definintions),
    }),
    {} as Environment
  );

  const missingKeys = Object.keys(environment)
    .filter((key) => typeof environment[key as EnvKey] === undefined)
    .map((key) => `"${key}"`)
    .join(', ');

  if (missingKeys.length) {
    throw new Error(
      `Error setting up the app environment. The following variables are missing from your environment: ${missingKeys}.`
    );
  }

  return (
    <EnvironmentContext.Provider
      value={{
        ...environment,
        ADDRESSES: ContractAddresses[environment['VEGA_ENV']],
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      'Error running "useEnvironment". No context found, make sure your component is wrapped in an <EnvironmentProvider />.'
    );
  }
  return context;
};
