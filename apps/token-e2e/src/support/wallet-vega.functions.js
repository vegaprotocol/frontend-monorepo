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
