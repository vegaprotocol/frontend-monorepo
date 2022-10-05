const vegaWalletContainer = '[data-testid="vega-wallet"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');

Cypress.Commands.add('vega_wallet_connect', () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(vegaWalletContainer).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  // Connect with gui as its the v1 service and tests should still pass. This will need
  // to be update to use v2
  cy.getByTestId('connector-gui').click();
  cy.get(restConnectorForm).within(() => {
    cy.get('#wallet').click().type(vegaWalletName);
    cy.get('#passphrase').click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });
  cy.get(vegaWalletNameElement).should('be.visible');
});
