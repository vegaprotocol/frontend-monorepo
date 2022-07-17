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
