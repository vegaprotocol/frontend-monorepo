declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      setVegaWalletConfig(): void;
    }
  }
}

export const addSetVegaWalletConfig = () => {
  Cypress.Commands.add('setVegaWalletConfig', () => {
    // store the vega wallet config so that the app can
    // connect eagerly and we don't need to connect for every test
    // note: cypress will clear localstorage after every test
    cy.window().then((win) => {
      win.localStorage.setItem(
        'vega_wallet_config',
        JSON.stringify({
          token: Cypress.env('CAPSULE_VEGA_WALLET_API_TOKEN'),
          connector: 'jsonRpc',
          url: 'http://localhost:1789',
        })
      );
    });
  });
};
