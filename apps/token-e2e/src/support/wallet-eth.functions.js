const ethWalletContainer = '[data-testid="ethereum-wallet"]';
const connectToEthButton = '[data-testid="connect-to-eth-wallet-button"]';
const capsuleWalletConnectButton = '[data-testid="web3-connector-Unknown"]';

Cypress.Commands.add('ethereum_wallet_connect', () => {
  cy.highlight('Connecting Eth Wallet');
  cy.get(connectToEthButton).within(() => {
    cy.contains('Connect Ethereum wallet to associate $VEGA')
      .should('be.visible')
      .click();
  });
  cy.get(capsuleWalletConnectButton).click();
  cy.get(capsuleWalletConnectButton, { timeout: 60000 }).should('not.exist');
  cy.get(ethWalletContainer).within(() => {
    // this check is required since it ensures the wallet is fully (not partially) loaded
    cy.contains('Locked', { timeout: 15000 }).should('be.visible');
  });
});

Cypress.Commands.add(
  'ethereum_wallet_check_associated_value_is',
  (expectedVal) => {
    cy.highlight(`Checking Eth Wallet - Associated Value is ${expectedVal}`);
    cy.get(ethWalletContainer).within(() => {
      cy.contains('Associated', { timeout: 20000 })
        .parent()
        .siblings()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

Cypress.Commands.add(
  'ethereum_wallet_check_associated_vega_key_value_is',
  (vegaShortPublicKey, expectedVal) => {
    cy.highlight(
      `Checking Eth Wallet - Vega Key Associated Value is ${expectedVal} for key ${vegaShortPublicKey}`
    );
    cy.get(ethWalletContainer).within(() => {
      cy.contains(vegaShortPublicKey, { timeout: 20000 })
        .parent()
        .contains(expectedVal, { timeout: 40000 })
        .should('be.visible');
    });
  }
);

Cypress.Commands.add(
  'ethereum_wallet_check_associated_vega_key_is_no_longer_showing',
  (vegaShortPublicKey) => {
    cy.highlight('Checking Eth Wallet - Vega Key Associated is not showing');
    cy.get(ethWalletContainer).within(() => {
      cy.contains(vegaShortPublicKey, { timeout: 20000 }).should('not.exist');
    });
  }
);
