import wallet from '../locators/wallet.locators';

Cypress.Commands.add('walletVega_connect', function () {
  const walletName = Cypress.env('TRADING_TEST_VEGA_WALLET_NAME');
  const walletPassphrase = Cypress.env('TRADING_TEST_VEGA_WALLET_PASSPHRASE');
  const walletTruncatedKey = Cypress.env('TRUNCATED_VEGA_PUBLIC_KEY');

  cy.get(wallet.vegawallet).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled')
      .click();
  });

  cy.get('button').contains('rest provider').click();

  cy.get(wallet.connectRestForm).within(() => {
    cy.get(wallet.name).click().type(walletName);
    cy.get(wallet.passphrase).click().type(walletPassphrase);
    cy.get('button').contains('Connect').click();
  });

  cy.get(wallet.vegawallet).within(() => {
    cy.contains(walletTruncatedKey).should('be.visible');
    cy.contains('Assets', { timeout: 20000 }).should('be.visible');
  });
});

Cypress.Commands.add('walletVega_getUnstakedAmount', function () {
  cy.get(wallet.vegawallet).contains('Unstaked').siblings().invoke('text');
});

Cypress.Commands.add(
  'walletVega_checkValidator_StakeNextEpochValue_is',
  function (validatorName, expectedVal) {
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`)
        .siblings()
        .contains(parseFloat(expectedVal).toPrecision(16));
    });
  }
);

Cypress.Commands.add(
  'walletVega_check_UnstakedValue_is',
  function (expectedVal) {
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`Unstaked`)
        .siblings()
        .contains(parseFloat(expectedVal).toPrecision(16));
    });
  }
);
