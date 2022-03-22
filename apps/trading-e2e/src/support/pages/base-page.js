export default class BasePage {
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';
  connectVegaBtn = 'connect-vega-wallet';
  walletConnectors = 'connectors-list';
  walletForm = 'rest-connector-form';
  walletFormError = 'form-error';

  navigateToPortfolio() {
    cy.get(`a[href='${this.porfolioUrl}']`).click();
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`).click();
  }

  navigateToConnectVegaWallet() {
    cy.getByTestId(this.connectVegaBtn).click();
    cy.contains('Connects using REST to a running Vega wallet service');
    cy.getByTestId(this.walletConnectors).find('button').click();
  }

  fillInWalletForm(walletName, walletPassphrase) {
    cy.getByTestId(this.walletForm)
      .find('#wallet')
      .click({ force: true })
      .type(walletName);
    cy.getByTestId(this.walletForm)
      .find('#passphrase')
      .click({ force: true })
      .type(walletPassphrase);
  }

  clickConnectVegaWallet() {
    cy.getByTestId(this.walletForm).find('button[type=submit]').click();
  }

  validateWalletNotRunningError() {
    cy.getByTestId(this.walletFormError).should(
      'have.text',
      'Wallet not running at http://localhost:1789'
    );
  }

  validateWalletErrorFieldsDisplayed() {
    cy.getByTestId(this.walletForm)
      .find('div > div')
      .should('contain.text', 'Required')
      .should('have.length', 2);
  }
}
