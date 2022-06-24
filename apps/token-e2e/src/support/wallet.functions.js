import wallet from '../locators/wallet.locators';

// ----------------------------------------------------------------------

Cypress.Commands.add('walletVega_create', function () {
  cy.exec('vegawallet init -f --home ~/.vegacapsule/testnet/wallet').then(() => {
    cy.exec('echo "123" > ~/.vegacapsule/testnet/wallet/passphrase.txt').then(() => {
      cy.exec('vegawallet create --wallet capsule_wallet -p ./passphrase.txt  --home ~/.vegacapsule/testnet/wallet', {failOnNonZeroExit: false}).then(() => {
        cy.exec('vegawallet service run --network DV --automatic-consent  --home ~/.vegacapsule/testnet/wallet').then(() => {
          return
        })
      })
    })
  })
});

// ----------------------------------------------------------------------

Cypress.Commands.add('walletVega_connect', function () {

  const walletName = "capsule_wallet";
  const walletPassphrase = "123"

  cy.get(wallet.vegawallet).within(() => {
    cy.get('button')
      .contains('Connect Vega wallet to use associated $VEGA')
      .should('be.enabled').and('be.visible').click({force:true})
    });

  cy.get('button').contains('rest provider').click();

  cy.get(wallet.connectRestForm).within(() => {
    cy.get(wallet.name).click().type(walletName);
    cy.get(wallet.passphrase).click().type(walletPassphrase);
    cy.get('button').contains('Connect').click();
  });

  cy.contains('capsule_wallet key 1', { timeout: 20000 }).should('be.visible');
});

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'walletVega_checkThisValidator_StakeNextEpochValue_is',
  function (validatorName, expectedVal) {
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`${validatorName} (Next epoch)`)
        .siblings()
        .contains(parseFloat(expectedVal).toPrecision(16));
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add(
  'walletVega_check_UnstakedValue_is',
  function (expectedVal) {
    cy.get(wallet.vegawallet).within(() => {
      cy.contains(`Unstaked`)
        .siblings()
        .contains(parseFloat(expectedVal).toPrecision(16), {timeout:10000});
    });
  }
);

// ----------------------------------------------------------------------

Cypress.Commands.add('walletEth_connect', function () {
  cy.get(wallet.ethWalletConnectToEth).within(() => {
    cy.contains('Connect Ethereum wallet to associate $VEGA')
      .should('be.visible').click();
  });

  cy.get(wallet.ethWalletConnect).click();
  cy.contains('Ethereum wallet connected').should('be.visible');
});