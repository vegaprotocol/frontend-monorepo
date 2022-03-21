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
    cy.getByTestId(this.walletForm).find('#wallet').type(walletName);
    cy.getByTestId(this.walletForm).find('#passphrase').type(walletPassphrase);
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

  formatDate(date) {
    const padZero = (num) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
