// Types
export * from './types';
export * from './transaction-types';

// Core
export { createConfig, VegaWalletProvider } from './wallet';
export { fairground, stagnet, Chain } from './chains';
export {
  useConfig,
  useConnect,
  useChainId,
  useDisconnect,
  useSendTransaction,
  usePubKeys,
  useWallet,
} from './wallet';

// Connectors
export {
  InjectedConnector,
  SnapConnector,
  JsonRpcConnector,
  ReadOnlyConnector,
} from './connectors';

// Utils
export { determineId } from './utils';

// old stuff
export { useVegaWalletDialogStore } from './use-dialog-store';
export { useVegaWallet } from './use-vega-wallet';
export { isBrowserWalletInstalled } from './utils';
export { useEagerConnect } from './use-eager-connect';

// UI
// TODO: split this out into reat only lib
export { ConnectDialog } from './connect-dialog';
