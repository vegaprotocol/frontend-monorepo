const windowOrDefault = (key: string) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  return process.env[key] || '';
};

const TRUTHY = ['1', 'true'];

export const ENV = {
  // Environment
  dsn: windowOrDefault('NX_SENTRY_DSN'),
  envName: windowOrDefault('NX_VEGA_ENV'),
  commit: windowOrDefault('NX_COMMIT_REF'),
  branch: windowOrDefault('NX_BRANCH'),
  vegaUrl: windowOrDefault('NX_VEGA_URL'),
  urlConnect: TRUTHY.includes(windowOrDefault('NX_ETH_URL_CONNECT')),
  ethWalletMnemonic: windowOrDefault('NX_ETH_WALLET_MNEMONIC'),
  localProviderUrl: windowOrDefault('NX_LOCAL_PROVIDER_URL'),
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
};
