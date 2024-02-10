export { InjectedConnector } from './connectors-v2/injected-connector';
export { SnapConnector } from './connectors-v2/snap-connector';
export { JsonRpcConnector } from './connectors-v2/json-rpc-connector';
export * from './types';
export { createConfig, VegaWalletProvider } from './wallet';

export {
  useConfig,
  useConnect,
  useDisconnect,
  useSendTransaction,
} from './wallet';

export { fairground, stagnet, Chain } from './chains';
