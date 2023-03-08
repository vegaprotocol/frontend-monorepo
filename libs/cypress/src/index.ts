import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import { addMockGQLCommand } from './lib/mock-gql';
import { addMockSubscription } from './lib/mock-ws';
import { addMockWalletCommand } from './lib/mock-rest';
import { addMockWeb3ProviderCommand } from './lib/commands/mock-web3-provider';
import { addSlackCommand } from './lib/commands/slack';
import { addHighlightLog } from './lib/commands/highlight-log';
import { addGetAssets } from './lib/commands/get-assets';
import { addVegaWalletReceiveFaucetedAsset } from './lib/commands/vega-wallet-receive-fauceted-asset';
import { addContainsExactly } from './lib/commands/contains-exactly';
import { addGetNetworkParameters } from './lib/commands/get-network-parameters';
import { addUpdateCapsuleMultiSig } from './lib/commands/add-validators-to-multisig';
import {
  addVegaWalletConnect,
  addSetVegaWallet,
} from './lib/commands/vega-wallet-connect';
import { addMockTransactionResponse } from './lib/commands/mock-transaction-response';
import { addCreateMarket } from './lib/commands/create-market';
import { addConnectPublicKey } from './lib/commands/add-connect-public-key';
import { addVegaWalletSubmitProposal } from './lib/commands/vega-wallet-submit-proposal';
import { addGetNodes } from './lib/commands/get-nodes';
import { addVegaWalletSubmitLiquidityProvision } from './lib/commands/vega-wallet-submit-liquidity-provision';

addGetTestIdcommand();
addSlackCommand();
addMockGQLCommand();
addMockSubscription();
addMockWalletCommand();
addMockWeb3ProviderCommand();
addHighlightLog();
addVegaWalletReceiveFaucetedAsset();
addGetAssets();
addGetNodes();
addContainsExactly();
addGetNetworkParameters();
addUpdateCapsuleMultiSig();
addVegaWalletConnect();
addSetVegaWallet();
addMockTransactionResponse();
addCreateMarket();
addConnectPublicKey();
addVegaWalletSubmitProposal();
addVegaWalletSubmitLiquidityProvision();

export { mockConnectWallet } from './lib/commands/vega-wallet-connect';
export type { onMessage } from './lib/mock-ws';
export { aliasGQLQuery } from './lib/mock-gql';
export { aliasWalletQuery } from './lib/mock-rest';
export * from './lib/utils';

Cypress.on(
  'uncaught:exception',
  (err) => !err.message.includes('ResizeObserver loop limit exceeded')
);
