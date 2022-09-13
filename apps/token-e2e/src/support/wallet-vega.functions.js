const vegaWalletContainer = '[data-testid="vega-wallet"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const vegaWalletNameElement = '[data-testid="wallet-name"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletLocation = Cypress.env('vegaWalletLocation');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');

Cypress.Commands.add('vega_wallet_import', () => {
  cy.highlight(`Importing Vega Wallet ${vegaWalletName}`);
  cy.exec(`vega wallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `vega wallet import -w ${vegaWalletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet`,
    { failOnNonZeroExit: false }
  );
  cy.exec(
    `vega wallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );
  cy.exec(`vega wallet version`)
    .its('stdout')
    .then((output) => {
      cy.log(output);
    });
});

Cypress.Commands.add('vega_wallet_connect', () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(vegaWalletContainer).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  cy.get('button').contains('rest provider').click();
  cy.get(restConnectorForm).within(() => {
    cy.get('#wallet').click().type(vegaWalletName);
    cy.get('#passphrase').click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });
  cy.get(vegaWalletNameElement).should('be.visible');
});
