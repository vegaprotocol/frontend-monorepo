import { storedApiNodeSchema } from '@vegaprotocol/environment';
import { createMarket } from '../capsule/create-market';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      createMarket(): void;
    }
  }
}

export const addCreateMarket = () => {
  Cypress.Commands.add('createMarket', () => {
    const apiNode = storedApiNodeSchema.parse(Cypress.env('API_NODE'));
    if (!apiNode) {
      throw new Error('API_NODE not configured');
    }

    const config = {
      vegaPubKey: Cypress.env('VEGA_PUBLIC_KEY'),
      token: Cypress.env('VEGA_WALLET_API_TOKEN'),
      ethWalletMnemonic: Cypress.env('ETH_WALLET_MNEMONIC'),
      ethereumProviderUrl: Cypress.env('ETHEREUM_PROVIDER_URL'),
      vegaWalletUrl: Cypress.env('VEGA_WALLET_URL'),
      vegaUrl: apiNode.graphQLApiUrl,
      faucetUrl: Cypress.env('FAUCET_URL'),
    };

    cy.highlight('creating market on capsule environment');

    cy.wrap(createMarket(config), {
      timeout: 9 * 60 * 1000,
    })
      // register market list result so it can be retrieved in tests later
      .as('markets');

    // make sure we have a market to test against, createMarket will
    // return an array of markets or false if setup failed
    cy.get('@markets').should('not.equal', false);
  });
};
