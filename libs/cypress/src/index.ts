import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import {
  addMockGQLCommand,
  addMockGQLSubscriptionCommand,
} from './lib/commands/mock-gql';
import { addMockVegaWalletCommands } from './lib/commands/mock-vega-wallet';
import { addMockWeb3ProviderCommand } from './lib/commands/mock-web3-provider';
import { addSlackCommand } from './lib/commands/slack';
import { addHighlightLog } from './lib/commands/highlight-log';
import { addGetAssetInformation } from './lib/commands/get-asset-information';
import { addVegaWalletReceiveFaucetedAsset } from './lib/commands/vega-wallet-receive-fauceted-asset';
import { addVegaWalletImport } from './lib/commands/vega-wallet-import';
import { addContainsExactly } from './lib/commands/contains-exactly';
import { addRestartVegacapsuleNetwork } from './lib/commands/restart-vegacapsule-network';
import { addGetNetworkParameters } from './lib/commands/get-network-parameters';
import { addUpdateCapsuleMultiSig } from './lib/commands/add-validators-to-multisig';

addGetTestIdcommand();
addSlackCommand();
addMockGQLCommand();
addMockGQLSubscriptionCommand();
addMockVegaWalletCommands();
addMockWeb3ProviderCommand();
addHighlightLog();
addVegaWalletReceiveFaucetedAsset();
addGetAssetInformation();
addVegaWalletImport();
addContainsExactly();
addRestartVegacapsuleNetwork();
addGetNetworkParameters();
addUpdateCapsuleMultiSig();

export * from './lib/graphql-test-utils';
export type { onMessage } from './lib/commands/mock-gql';

Cypress.on(
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
);
