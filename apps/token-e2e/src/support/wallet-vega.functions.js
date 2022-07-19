const vegaWalletContainer = '[data-testid="vega-wallet"]';
const restConnectorForm = '[data-testid="rest-connector-form"]';
const vegaWalletName = Cypress.env('vegaWalletName');
const vegaWalletLocation = Cypress.env('vegaWalletLocation');
const vegaWalletPassphrase = Cypress.env('vegaWalletPassphrase');
const vegaWalletPublicKey = Cypress.env('vegaWalletPublicKey');

Cypress.Commands.add('vega_wallet_import', () => {
  cy.highlight(`Importing Vega Wallet ${vegaWalletName}`);
  cy.exec(`vegawallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `vegawallet import -w ${vegaWalletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet`,
    { failOnNonZeroExit: false }
  );
  cy.exec(
    `vegawallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );
});

Cypress.Commands.add(
  'vega_wallet_create_proposal_freeform',
  (durationMinutes) => {
    let proposal = {};
    cy.fixture('/proposals/freeform.json').then((freeformProposal) => {
      let timestamp = Math.floor(Date.now() / 1000);
      timestamp += durationMinutes * 60;
      freeformProposal.proposalSubmission.terms.closingTimestamp = timestamp;
      freeformProposal.proposalSubmission.rationale.description += timestamp;
      let proposalPayload = JSON.stringify(freeformProposal);

      cy.exec(
        `vegawallet command send -w ${vegaWalletName} --pubkey ${vegaWalletPublicKey} --home ~/.vegacapsule/testnet/wallet -p ./src/fixtures/wallet/passphrase --network DV '${proposalPayload}'`,
        { failOnNonZeroExit: false }
      )
        .its('stdout')
        .then((stdout) => {
          proposal['response'] = stdout;
          proposal['description'] =
            freeformProposal.proposalSubmission.rationale.description;
          return proposal;
        });
    });
  }
);

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
  cy.contains(`${vegaWalletName} key`, { timeout: 20000 }).should('be.visible');
});
