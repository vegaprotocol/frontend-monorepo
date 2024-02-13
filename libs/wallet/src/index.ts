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
  usePubKeys,
  useWallet,
} from './wallet';

export { ConnectDialog } from './connect-dialog-v2';

// old stuff
export { useVegaWalletDialogStore } from './connect-dialog/vega-wallet-dialog-store';
export { useVegaWallet } from './use-vega-wallet';
export { isBrowserWalletInstalled } from './utils';

export { fairground, stagnet, Chain } from './chains';
