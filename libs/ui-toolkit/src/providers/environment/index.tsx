import { ReactNode, createContext, useContext } from 'react';

declare global {
  interface Window {
    _ENV?: Environment,
  }
}

const EnvironmentContext = createContext({} as Environment);

type EnvironmentProviderProps = {
  children?: ReactNode;
}

export const ENV_KEYS = [
  'VEGA_URL',
  'VEGA_ENV',
  'ETHEREUM_CHAIN_ID',
  'ETHEREUM_PROVIDER_URL',
  'ETHERSCAN_URL',
] as const;

type EnvKey = typeof ENV_KEYS[number];

export type Environment = Record<EnvKey, string>

const getValue = (key: EnvKey) => {
  if (typeof window === 'undefined') {
    return process.env[key];
  }
  return window._ENV?.[key] ?? process.env[key];
}

export const EnvironmentProvider = ({ children }: EnvironmentProviderProps) => {
  const environment = ENV_KEYS.reduce((acc, key) => ({
    ...acc,
    [key]: getValue(key),
  }), {} as Environment)

  const missingKeys = Object.keys(environment)
    .filter(key => !environment[key as EnvKey])
    .map(key => `"${key}"`)
    .join(', ');

  console.warn(`Error setting up the app environment. The following variables are missing from your environment: ${missingKeys}`)

  return (
    <EnvironmentContext.Provider value={environment as Environment}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => useContext(EnvironmentContext);
