const windowOrDefault = (key: string) => {
  if (typeof window !== 'undefined') {
    if (window._env_ && window._env_[key]) {
      return window._env_[key];
    }
  }
  return process.env[key] || '';
};

export const ENV = {
  // Environment
  nodeEnv: windowOrDefault('NODE_ENV'),
  dsn: windowOrDefault('NX_TRADING_SENTRY_DSN'),
  envName: windowOrDefault('NX_VEGA_ENV'),
  chainId: windowOrDefault('NX_ETHEREUM_CHAIN_ID'),
  vegaUrl: windowOrDefault('NX_VEGA_URL'),
  providerUrl: windowOrDefault('NX_ETHEREUM_PROVIDER_URL'),
  etherscanUrl: windowOrDefault('NX_ETHERSCAN_URL'),
  flags: {},
};
