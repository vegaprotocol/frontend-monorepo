const vegaWalletContainer = '[data-testid="vega-wallet"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');

Cypress.Commands.add('vega_wallet_connect', () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(vegaWalletContainer, {timeout: 6000}).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  // Connect with gui as its the v1 service and tests should still pass. This will need
  // to be update to use v2
  cy.getByTestId('connector-cli').click();
  // cy.get(restConnectorForm).within(() => {
  //   cy.get('#wallet').click().type(vegaWalletName);
  //   cy.get('#passphrase').click().type(vegaWalletPassphrase);
  //   cy.get('button').contains('Connect').click();
  // });
  cy.get(vegaWalletNameElement).should('be.visible');
});

Cypress.Commands.add(
  'vega_wallet_faucet_assets_without_check',
  function (asset, amount, vegaWalletPublicKey) {
    cy.highlight(`Topping up vega wallet with ${asset}, amount: ${amount}`);
    cy.exec(
      `curl -X POST -d '{"amount": "${amount}", "asset": "${asset}", "party": "${vegaWalletPublicKey}"}' http://localhost:1790/api/v1/mint`
    )
      .its('stdout')
      .then((response) => {
        assert.include(
          response,
          `"success":true`,
          'Ensuring curl command was successfully undertaken'
        );
      });
  }
);
