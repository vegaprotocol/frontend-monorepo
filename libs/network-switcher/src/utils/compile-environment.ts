import type { Networks } from '@vegaprotocol/smart-contracts';
import { EnvironmentConfig } from '@vegaprotocol/smart-contracts';
import type { Environment, RawEnvironment, EnvKey } from '../types';
import { ENV_KEYS } from '../types';

declare global {
  interface Window {
    _ENV?: RawEnvironment;
  }
}

const isBrowser = typeof window !== 'undefined';

const produceNetworkKeyPair = (acc: Record<Networks, string>, raw: string) => {
  const [network, ...urlChunks] = raw.split('=');
  return {
    ...acc,
    [network]: urlChunks.join(''),
  };
};

const transformValue = (key: EnvKey, value?: string) => {
  switch (key) {
    case 'VEGA_ENV':
      return value as Networks;
    case 'ETHEREUM_CHAIN_ID':
      return value && Number(value);
    case 'VEGA_NETWORKS': {
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          throw new Error(
            'Error parsing the "NX_VEGA_NETWORKS" environment variable. Make sure it has a valid JSON format.'
          );
        }
      }
      return undefined;
    }
    default:
      return value;
  }
};

const getBundledEnvironmentValue = (key: EnvKey) => {
  switch (key) {
    // need to have these hardcoded so on build time we can insert sensible defaults
    case 'VEGA_URL':
      return process.env['NX_VEGA_URL'];
    case 'VEGA_ENV':
      return process.env['NX_VEGA_ENV'];
    case 'VEGA_CONFIG_URL':
      return process.env['NX_VEGA_CONFIG_URL'];
    case 'ETHEREUM_CHAIN_ID':
      return process.env['NX_ETHEREUM_CHAIN_ID'];
    case 'ETHEREUM_PROVIDER_URL':
      return process.env['NX_ETHEREUM_PROVIDER_URL'];
    case 'ETHERSCAN_URL':
      return process.env['NX_ETHERSCAN_URL'];
    case 'VEGA_NETWORKS':
      return process.env['NX_VEGA_NETWORKS'];
  }
};

const getValue = (key: EnvKey, definitions: Partial<RawEnvironment> = {}) => {
  if (!isBrowser) {
    return transformValue(
      key,
      definitions[key] ?? getBundledEnvironmentValue(key)
    );
  }
  return transformValue(
    key,
    window._ENV?.[key] ?? definitions[key] ?? getBundledEnvironmentValue(key)
  );
};

export const compileEnvironment = (
  definitions?: Partial<RawEnvironment>
): Environment => {
  const environment = ENV_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: getValue(key, definitions),
    }),
    {} as Environment
  );

  return {
    ...environment,
    ADDRESSES: EnvironmentConfig[environment['VEGA_ENV']],
    VEGA_NETWORKS: {
      [environment.VEGA_ENV]: isBrowser
        ? window.location.href
        : environment.VEGA_NETWORKS[environment.VEGA_ENV],
      ...environment.VEGA_NETWORKS,
    },
  };
};
