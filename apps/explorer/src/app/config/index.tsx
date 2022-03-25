export const DATA_SOURCES = {
  chainExplorerUrl: process.env['NX_CHAIN_EXPLORER_URL'] as string,
  tendermintUrl: process.env['NX_TENDERMINT_URL'] as string,
  tendermintWebsocketUrl: process.env['NX_TENDERMINT_WEBSOCKET_URL'] as string,
  dataNodeUrl: process.env['NX_VEGA_URL'] as string,
  envName: process.env['NX_VEGA_ENV'] as string,
  restEndpoint: process.env['NX_VEGA_REST'] as string,
};
