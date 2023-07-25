import { addGetTestIdcommand } from './lib/commands/get-by-test-id';
import { addMockGQLCommand } from './lib/mock-gql';
import { addMockSubscription } from './lib/mock-ws';
import { addMockWalletCommand } from './lib/mock-rest';
import { addMockWeb3ProviderCommand } from './lib/commands/mock-web3-provider';
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
import { addValidatorsSelfDelegate } from './lib/commands/validators-self-delegate';
import { addVegaWalletSubmitProposal } from './lib/commands/vega-wallet-submit-proposal';
import { addGetNodes } from './lib/commands/get-nodes';
import { addVegaWalletSubmitLiquidityProvision } from './lib/commands/vega-wallet-submit-liquidity-provision';
import { addImportNodeWallets } from './lib/commands/import-node-wallets';
import { addVegaWalletTopUpRewardsPool } from './lib/commands/vega-wallet-top-up-rewards-pool';
import { addAssociateTokensToVegaWallet } from './lib/commands/associate-tokens-to-vega-wallet';

addGetTestIdcommand();
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
addValidatorsSelfDelegate();
addVegaWalletSubmitProposal();
addVegaWalletSubmitLiquidityProvision();
addImportNodeWallets();
addVegaWalletTopUpRewardsPool();
addAssociateTokensToVegaWallet();

export {
  mockConnectWallet,
  mockConnectWalletWithUserError,
} from './lib/commands/vega-wallet-connect';
export type { onMessage } from './lib/mock-ws';
export { aliasGQLQuery } from './lib/mock-gql';
export { aliasWalletQuery } from './lib/mock-rest';
export * from './lib/utils';

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes(
      'ResizeObserver loop completed with undelivered notifications'
    )
  ) {
    return false;
  }
  return true;
});
