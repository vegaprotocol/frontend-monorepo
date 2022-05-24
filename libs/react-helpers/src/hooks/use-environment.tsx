import type { ReactNode } from 'react';
import type { Networks } from '@vegaprotocol/smart-contracts-sdk';
import { EnvironmentConfig } from '@vegaprotocol/smart-contracts-sdk';
import { createContext, useContext } from 'react';

declare global {
  interface Window {
    _ENV?: RawEnvironment;
  }
}

type VegaContracts = typeof EnvironmentConfig[Networks];

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
      return Number(value) ?? 3;
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
    .filter((key) => !environment[key as EnvKey])
    .map((key) => `"${key}"`)
    .join(', ');

  if (missingKeys) {
    console.warn(
      `Error setting up the app environment. The following variables are missing from your environment: ${missingKeys}.`
    );
  }

  return (
    <EnvironmentContext.Provider
      value={{
        ...environment,
        ADDRESSES: EnvironmentConfig[environment['VEGA_ENV']],
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
