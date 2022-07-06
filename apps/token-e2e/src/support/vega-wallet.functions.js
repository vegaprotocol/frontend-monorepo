import wallet from '../locators/wallet.locators';

const vegaWalletName = Cypress.env("vegaWalletName");
const vegaWalletLocation = Cypress.env("vegaWalletLocation");
const vegaWalletPassphrase = Cypress.env("vegaWalletPassphrase");

cy.vega_wallet_import = () => {
  cy.highlight(`Importing Vega Wallet ${vegaWalletName}`);
  cy.exec(`vegawallet init -f --home ${vegaWalletLocation}`);
  cy.exec(
    `vegawallet import -w ${vegaWalletName} --recovery-phrase-file ./src/fixtures/wallet/recovery -p ./src/fixtures/wallet/passphrase --home ~/.vegacapsule/testnet/wallet`,
    { failOnNonZeroExit: false }
  );
  cy.exec(
    `vegawallet service run --network DV --automatic-consent  --home ${vegaWalletLocation}`
  );
};

cy.vega_wallet_connect = () => {
  cy.highlight('Connecting Vega Wallet');
  cy.get(wallet.vegawallet).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .and('be.visible')
      .click({ force: true });
  });
  cy.get('button').contains('rest provider').click();
  cy.get(wallet.connectRestForm).within(() => {
    cy.get(wallet.name).click().type(vegaWalletName);
    cy.get(wallet.passphrase).click().type(vegaWalletPassphrase);
    cy.get('button').contains('Connect').click();
  });
  cy.contains(`${vegaWalletName} key`, { timeout: 20000 }).should('be.visible');
};

cy.vega_wallet_check_unstaked_value_is = (expectedVal) => {
  cy.highlight(`Checking vega wallet - Unstaked Value is ${expectedVal}`);
  cy.get(wallet.vegawallet).within(() => {
    cy.contains('Unstaked', { timeout: 40000 })
      .siblings()
      .contains(expectedVal, { timeout: 40000 })
      .should('be.visible');
  });
};

cy.vega_wallet_check_associated_value_is = (expectedVal) => {
  cy.highlight(`Checking vega wallet - Associated Value is ${expectedVal}`);
  cy.get(wallet.vegawallet).within(() => {
    cy.contains('Associated', { timeout: 40000 })
      .parent()
      .siblings()
      .contains(expectedVal, { timeout: 40000 })
      .should('be.visible');
  });
};