import BasePage from './base-page';

export default class EthWalletPage extends BasePage {
  connectWalletBtnId = 'connect-eth-wallet-btn';
  connectWalletMsgId = 'connect-eth-wallet-msg';

  clickConnectEthBtn() {
    cy.getByTestId(this.connectWalletBtnId).should('be.enabled').click();
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
