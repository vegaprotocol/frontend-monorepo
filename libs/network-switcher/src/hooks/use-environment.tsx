import type { ReactNode } from 'react';
import type { Networks } from '@vegaprotocol/smart-contracts';
import { EnvironmentConfig } from '@vegaprotocol/smart-contracts';
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
  'NX_VEGA_NETWORKS'
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
  NX_VEGA_NETWORKS: Record<Networks, string>
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
    case 'NX_VEGA_NETWORKS':
      return process.env['NX_VEGA_NETWORKS'];
  }
};

const produceNetworkKeyPair = (acc: Record<Networks, string>, raw: string) => {
  const [network, ...urlChunks] = raw.split('=');
  return {
    ...acc,
    [network]: urlChunks.join(''),
  };
}

const transformValue = (key: EnvKey, value?: string) => {
  switch (key) {
    case 'VEGA_ENV':
      return value as Networks;
    case 'ETHEREUM_CHAIN_ID':
      return value && Number(value);
    case 'NX_VEGA_NETWORKS':
      return value && value
        .split(';')
        .reduce<Record<Networks, string>>(produceNetworkKeyPair, {} as Record<Networks, string>)
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
