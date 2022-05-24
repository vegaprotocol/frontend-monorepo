import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

declare global {
  interface Window {
    _ENV?: Environment;
  }
}

const EnvironmentContext = createContext({} as Environment);

type EnvironmentProviderProps = {
  definintions?: Partial<Environment>;
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

export type Environment = Record<EnvKey, string>;

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

const getValue = (key: EnvKey, definintions: Partial<Environment> = {}) => {
  if (typeof window === 'undefined') {
    return definintions[key] ?? getBundledEnvironmentValue(key);
  }
  return (
    window._ENV?.[key] ?? definintions[key] ?? getBundledEnvironmentValue(key)
  );
};

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
      `Error setting up the app environment. The following variables are missing from your environment: ${missingKeys}`
    );
  }

  return (
    <EnvironmentContext.Provider value={environment as Environment}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => useContext(EnvironmentContext);
