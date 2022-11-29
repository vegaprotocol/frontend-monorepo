const vegaWalletContainer = '[data-testid="vega-wallet"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';

Cypress.Commands.add('vega_wallet_connect', () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(vegaWalletContainer, { timeout: 6000 }).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  cy.getByTestId('connector-jsonRpc').click();
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
