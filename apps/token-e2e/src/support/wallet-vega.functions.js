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

Cypress.Commands.add('connectPublicKey', function (pubKey) {
  cy.getByTestId('connect-vega-wallet').then((connectWallet) => {
    if (connectWallet.length) {
      cy.getByTestId('connect-vega-wallet').click();
      cy.getByTestId('connector-view').should('be.visible').click();
      cy.getByTestId('address').click();
      cy.getByTestId('address').type(pubKey);
      cy.getByTestId('connect').click();
    }
  });
});
