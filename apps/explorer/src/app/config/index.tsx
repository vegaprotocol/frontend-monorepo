const windowOrDefault = (key: string) => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key] as string;
  }
  return process.env[key] as string;
};

export const DATA_SOURCES = {
  chainExplorerUrl: windowOrDefault('NX_CHAIN_EXPLORER_URL'),
  tendermintUrl: windowOrDefault('NX_TENDERMINT_URL'),
  tendermintWebsocketUrl: windowOrDefault('NX_TENDERMINT_WEBSOCKET_URL'),
  dataNodeUrl: windowOrDefault('NX_VEGA_URL'),
  envName: windowOrDefault('NX_VEGA_ENV'),
  restEndpoint: windowOrDefault('NX_VEGA_REST'),
};
