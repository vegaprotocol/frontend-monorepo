export {
  InjectedConnector,
  SnapConnector,
  JsonRpcConnector,
  ReadOnlyConnector,
} from './connectors-v2';
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
export { useEagerConnect } from './use-eager-connect';
export { getConfig } from './storage';

export { fairground, stagnet, Chain } from './chains';
