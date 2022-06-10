import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Networks } from '../lib/environment';

declare global {
  interface Window {
    _env_: Record<string, string>;
  }
}
interface VegaContracts {
  claimAddress: string;
  lockedAddress: string;
}

export const ContractAddresses: { [key in Networks]: VegaContracts } = {
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

type EnvironmentProviderProps = {
  definitions?: Partial<RawEnvironment>;
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

const getValue = (key: EnvKey, definitions: Partial<RawEnvironment> = {}) => {
  if (typeof window === 'undefined') {
    return transformValue(
      key,
      definitions[key] ?? getBundledEnvironmentValue(key)
    );
  }
  return transformValue(
    key,
    window._env_?.[key] ?? definitions[key] ?? getBundledEnvironmentValue(key)
  );
};

const EnvironmentContext = createContext({} as Environment);

export const EnvironmentProvider = ({
  definitions,
  children,
}: EnvironmentProviderProps) => {
  const environment = ENV_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: getValue(key, definitions),
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
