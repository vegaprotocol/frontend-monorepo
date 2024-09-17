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
  dataSources: {
    blockExplorerUrl: windowOrDefault('NX_BLOCK_EXPLORER'),
    oracleProofsUrl: windowOrDefault('NX_ORACLE_PROOFS_URL'),
    tendermintUrl: windowOrDefault('NX_TENDERMINT_URL'),
    tendermintWebsocketUrl: windowOrDefault('NX_TENDERMINT_WEBSOCKET_URL'),
    governanceUrl: windowOrDefault('NX_VEGA_GOVERNANCE_URL'),
    vegaRepoUrl: windowOrDefault('NX_VEGA_REPO_URL'),
  },
  vegaChainId: windowOrDefault('NX_VEGA_CHAIN_ID'),
};
