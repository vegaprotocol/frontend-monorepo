export class EthereumWallet {
  connectWalletBtnId = 'connect-eth-wallet-btn';
  connectWalletMsgId = 'connect-eth-wallet-msg';

  connect() {
    cy.getByTestId(this.connectWalletBtnId).should('be.enabled').click();
    cy.getByTestId('web3-connector-list').should('be.visible');
    cy.getByTestId('web3-connector-metamask').click();
  }

  verifyEthConnectBtnIsDisplayed() {
    cy.getByTestId(this.connectWalletBtnId)
      .should('be.visible')
      .and('have.text', 'Connect');
  }

  verifyConnectWalletMsg(ethNotConnectedText: string) {
    cy.getByTestId(this.connectWalletMsgId)
      .should('be.visible')
      .and('have.text', ethNotConnectedText);
  }
}
