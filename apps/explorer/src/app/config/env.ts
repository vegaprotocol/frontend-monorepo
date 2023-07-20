const windowOrDefault = (key: string) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key] as string;
  }
  return (process.env[key] as string) || '';
};

export const ENV = {
  // Data sources
  // Environment
  env: windowOrDefault('NX_VEGA_ENV'),
  dsn: windowOrDefault('NX_EXPLORER_SENTRY_DSN'),
  dataSources: {
    blockExplorerUrl: windowOrDefault('NX_BLOCK_EXPLORER'),
    tendermintUrl: windowOrDefault('NX_TENDERMINT_URL'),
    tendermintWebsocketUrl: windowOrDefault('NX_TENDERMINT_WEBSOCKET_URL'),
    ethExplorerUrl: windowOrDefault('NX_ETHERSCAN_URL'),
    governanceUrl: windowOrDefault('NX_VEGA_GOVERNANCE_URL'),
    vegaRepoUrl: windowOrDefault('NX_VEGA_REPO_URL'),
  },
  addresses: {
    feedback: windowOrDefault('NX_GITHUB_FEEDBACK_URL'),
  },
};
