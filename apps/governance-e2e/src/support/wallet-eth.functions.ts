const ethWalletContainer = '[data-testid="ethereum-wallet"]:visible';
const connectToEthButton =
  '[data-testid="connect-to-eth-wallet-button"]:visible';
const capsuleWalletConnectButton = '[data-testid="web3-connector-Unknown"]';

export function ethereumWalletConnect() {
  cy.highlight('Connecting Eth Wallet');
  cy.get(connectToEthButton, { timeout: 60000 }).within(() => {
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
  // Even once eth wallet connected - attempting a transaction will fail
  // It needs a few seconds before becoming operational
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(4000);
}
