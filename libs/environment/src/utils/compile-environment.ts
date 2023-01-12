import type { RawEnvironment, EnvKey, Environment } from '../types';
import { Networks, ENV_KEYS } from '../types';

declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

const isBrowser = typeof window !== 'undefined';

const getDefaultEtherumProviderUrl = (env: Networks) => {
  return env === Networks.MAINNET
    ? 'https://mainnet.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8'
    : 'https://sepolia.infura.io/v3/4f846e79e13f44d1b51bbd7ed9edefb8';
};

const getDefaultEtherscanUrl = (env: Networks) => {
  return env === Networks.MAINNET
    ? 'https://etherscan.io'
    : 'https://sepolia.etherscan.io';
};

const transformValue = (key: EnvKey, value?: string) => {
  switch (key) {
    case 'VEGA_ENV':
      return value as Networks;
    case 'VEGA_NETWORKS': {
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn(
            'Error parsing the "NX_VEGA_NETWORKS" environment variable. Make sure it has a valid JSON format.'
          );
          return {};
        }
      }
      return {};
    }
    case 'MAINTENANCE_PAGE':
      return ['true', '1', 'yes'].includes(value?.toLowerCase() || '');
    default:
      return value;
  }
};

const getBundledEnvironmentValue = (key: EnvKey) => {
  switch (key) {
    // need to have these hardcoded so on build time they can be replaced with the relevant environment variable
    case 'VEGA_URL':
      return process.env['NX_VEGA_URL'];
    case 'VEGA_ENV':
      return process.env['NX_VEGA_ENV'];
    case 'VEGA_CONFIG_URL':
      return process.env['NX_VEGA_CONFIG_URL'];
    case 'ETHEREUM_PROVIDER_URL':
      return process.env['NX_ETHEREUM_PROVIDER_URL'];
    case 'ETHERSCAN_URL':
      return process.env['NX_ETHERSCAN_URL'];
    case 'VEGA_NETWORKS':
      return process.env['NX_VEGA_NETWORKS'];
    case 'GIT_BRANCH':
      return process.env['NX_GIT_BRANCH'];
    case 'GIT_COMMIT_HASH':
      return process.env['NX_GIT_COMMIT_HASH'];
    case 'GIT_ORIGIN_URL':
      return process.env['NX_GIT_ORIGIN_URL'];
    case 'GITHUB_FEEDBACK_URL':
      return process.env['NX_GITHUB_FEEDBACK_URL'];
    case 'VEGA_EXPLORER_URL':
      return process.env['NX_VEGA_EXPLORER_URL'];
    case 'VEGA_WALLET_URL':
      return process.env['NX_VEGA_WALLET_URL'];
    case 'VEGA_TOKEN_URL':
      return process.env['NX_VEGA_TOKEN_URL'];
    case 'VEGA_DOCS_URL':
      return process.env['NX_VEGA_DOCS_URL'];
    case 'HOSTED_WALLET_URL':
      return process.env['NX_HOSTED_WALLET_URL'];
    case 'MAINTENANCE_PAGE':
      return (
        process.env['MAINTENANCE_PAGE'] || process.env['NX_MAINTENANCE_PAGE']
      );
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
    definitions[key] ??
      window._env_?.[`NX_${key}`] ??
      getBundledEnvironmentValue(key)
  );
};

export const compileEnvironment = (
  definitions?: Partial<RawEnvironment>
): Environment => {
  const environment = ENV_KEYS.reduce((acc, key) => {
    const value = getValue(key, definitions);

    if (value) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {} as Environment);

  const networkOverride = environment.VEGA_ENV
    ? {
        [environment.VEGA_ENV]: isBrowser ? window.location.origin : undefined,
      }
    : {};

  return {
    // @ts-ignore enable using default object props
    ETHERSCAN_URL: getDefaultEtherscanUrl(environment['VEGA_ENV']),
    // @ts-ignore enable using default object props
    ETHEREUM_PROVIDER_URL: getDefaultEtherumProviderUrl(
      environment['VEGA_ENV']
    ),
    ...environment,
    VEGA_NETWORKS: {
      ...networkOverride,
      ...environment.VEGA_NETWORKS,
    },
  };
};
