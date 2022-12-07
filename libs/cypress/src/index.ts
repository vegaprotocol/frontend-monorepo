import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import {
  addMockGQLCommand,
  addMockGQLSubscriptionCommand,
  addMockWalletGQLCommand,
} from './lib/commands/mock-gql';
import { addMockWeb3ProviderCommand } from './lib/commands/mock-web3-provider';
import { addSlackCommand } from './lib/commands/slack';
import { addHighlightLog } from './lib/commands/highlight-log';
import { addGetAssetInformation } from './lib/commands/get-asset-information';
import { addVegaWalletReceiveFaucetedAsset } from './lib/commands/vega-wallet-receive-fauceted-asset';
import { addContainsExactly } from './lib/commands/contains-exactly';
import { addGetNetworkParameters } from './lib/commands/get-network-parameters';
import { addUpdateCapsuleMultiSig } from './lib/commands/add-validators-to-multisig';
import { addVegaWalletConnect } from './lib/commands/vega-wallet-connect';
import { addMockTransactionResponse } from './lib/commands/mock-transaction-response';

addGetTestIdcommand();
addSlackCommand();
addMockGQLCommand();
addMockGQLSubscriptionCommand();
addMockWalletGQLCommand();
addMockWeb3ProviderCommand();
addHighlightLog();
addVegaWalletReceiveFaucetedAsset();
addGetAssetInformation();
addContainsExactly();
addGetNetworkParameters();
addUpdateCapsuleMultiSig();
addVegaWalletConnect();
addMockTransactionResponse();

export * from './lib/graphql-test-utils';
export { mockConnectWallet } from './lib/commands/vega-wallet-connect';
export type { onMessage } from './lib/commands/mock-gql';

Cypress.on(
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
);
