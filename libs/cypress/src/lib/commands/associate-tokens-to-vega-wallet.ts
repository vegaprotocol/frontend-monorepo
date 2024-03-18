import { stakeForVegaPublicKey } from '../capsule/ethereum-setup';
import { createEthereumWallet } from '../capsule/ethereum-wallet';
import { setGraphQLEndpoint } from '../capsule/request';
import { createWalletClient } from '../capsule/wallet-client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      associateTokensToVegaWallet(amount: string): void;
    }
  }
}

export function addAssociateTokensToVegaWallet() {
  Cypress.Commands.add('associateTokensToVegaWallet', (amount) => {
    const ethWalletMnemonic = Cypress.env('ETH_WALLET_MNEMONIC');
    const ethereumProviderUrl = Cypress.env('ETHEREUM_PROVIDER_URL');
    const vegaWalletUrl = Cypress.env('VEGA_WALLET_URL');
    const vegaUrl = Cypress.env('VEGA_URL');
    const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');
    const apiToken = Cypress.env('VEGA_WALLET_API_TOKEN');

    setGraphQLEndpoint(vegaUrl);
    createWalletClient(vegaWalletUrl, apiToken);
    createEthereumWallet(ethWalletMnemonic, ethereumProviderUrl);

    cy.highlight('Perform Eth tx at start of test');

    cy.wrap(stakeForVegaPublicKey(vegaPubKey, amount), { timeout: 60000 });
  });
}
