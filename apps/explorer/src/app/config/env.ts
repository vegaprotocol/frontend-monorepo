const windowOrDefault = (key: string) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key] as string;
  }
  return (process.env[key] as string) || '';
};

const truthy = ['1', 'true'];

export const ENV = {
  // Data sources
  // Environment
  dsn: windowOrDefault('NX_EXPLORER_SENTRY_DSN'),
  envName: windowOrDefault('NX_VEGA_ENV'),
  dataSources: {
    chainExplorerUrl: windowOrDefault('NX_CHAIN_EXPLORER_URL'),
    tendermintUrl: windowOrDefault('NX_TENDERMINT_URL'),
    tendermintWebsocketUrl: windowOrDefault('NX_TENDERMINT_WEBSOCKET_URL'),
    dataNodeUrl: windowOrDefault('NX_VEGA_URL'),
    restEndpoint: windowOrDefault('NX_VEGA_REST'),
  },
  flags: {
    assets: truthy.includes(windowOrDefault('NX_EXPLORER_ASSETS')),
    genesis: truthy.includes(windowOrDefault('NX_EXPLORER_GENESIS')),
    governance: truthy.includes(windowOrDefault('NX_EXPLORER_GOVERNANCE')),
    markets: truthy.includes(windowOrDefault('NX_EXPLORER_MARKETS')),
    oracles: truthy.includes(windowOrDefault('NX_EXPLORER_ORACLES')),
    txsList: truthy.includes(windowOrDefault('NX_EXPLORER_TXS_LIST')),
    networkParameters: truthy.includes(
      windowOrDefault('NX_EXPLORER_NETWORK_PARAMETERS')
    ),
    parties: truthy.includes(windowOrDefault('NX_EXPLORER_PARTIES')),
    validators: truthy.includes(windowOrDefault('NX_EXPLORER_VALIDATORS')),
  },
};
