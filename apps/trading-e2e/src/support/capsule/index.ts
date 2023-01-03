import { createMarket } from './create-market';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      createMarket(): void;
      setVegaWalletConfig(): void;
    }
  }
}
export const registerCapsuleCommands = () => {
  Cypress.Commands.add('createMarket', () => {
    const vegaPubKey = Cypress.env('VEGA_PUBLIC_KEY');
    const token = Cypress.env('VEGA_WALLET_API_TOKEN');
    const ethWalletMnemonic = Cypress.env('ETH_WALLET_MNEMONIC');

    cy.log('creating market on capsule environment');

    cy.wrap(createMarket(vegaPubKey, token, ethWalletMnemonic), {
      timeout: 60000,
    })
      // register market list result so it can be retrieved in tests later
      .as('markets');

    // make sure we have a market to test against, createMarket will
    // return an array of markets or false if setup failed
    cy.get('@markets').should('not.equal', false);
  });

  Cypress.Commands.add('setVegaWalletConfig', () => {
    // store the vega wallet config so that the app can
    // connect eagerly and we don't need to connect for every test
    // note: cypress will clear localstorage after every test
    cy.window().then((win) => {
      win.localStorage.setItem(
        'vega_wallet_config',
        JSON.stringify({
          token: Cypress.env('VEGA_WALLET_API_TOKEN'),
          connector: 'jsonRpc',
          url: 'http://localhost:1789',
        })
      );
    });
  });
};
