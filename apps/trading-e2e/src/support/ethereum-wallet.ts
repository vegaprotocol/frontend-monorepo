export const connectEthereumWallet = () => {
  cy.getByTestId('connect-eth-wallet-btn').should('be.enabled').click();
  cy.getByTestId('web3-connector-list').should('be.visible');
  cy.getByTestId('web3-connector-MetaMask').click();
};
