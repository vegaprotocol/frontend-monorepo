// Context
export { WalletContext, WalletProvider } from './context';

// Hooks
export { useChainId } from './hooks/use-chain-id';
export { useDialogStore } from './hooks/use-dialog-store';
export { useEagerConnect } from './hooks/use-eager-connect';
export {
  useSimpleTransaction,
  type Options,
  type Status,
} from './hooks/use-simple-transaction';
export { useSnapStatus } from './hooks/use-snap-status';
export { useVegaWallet } from './hooks/use-vega-wallet';
export { useConfig } from './hooks/use-config';
export { useConnect } from './hooks/use-connect';
export { useDisconnect } from './hooks/use-disconnect';
export { useSendTransaction } from './hooks/use-send-transaction';

// Components
export { ConnectDialog } from './components/connect-dialog';

// Testing
export {
  mockConfig,
  mockKeys,
  MockConnector,
  MockedWalletProvider,
} from './test-helpers';
