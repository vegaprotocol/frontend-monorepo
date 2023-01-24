export const connectEthereumWallet = (connectorName: string) => {
  cy.getByTestId('connect-eth-wallet-btn').should('be.enabled').click();
  cy.getByTestId('web3-connector-list').should('be.visible');
  cy.getByTestId(`web3-connector-${connectorName}`).click();
};
