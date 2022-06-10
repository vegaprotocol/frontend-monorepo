export default class VegaWallet {
  connectVegaBtn = 'connect-vega-wallet';
  walletConnectors = 'connectors-list';
  walletForm = 'rest-connector-form';
  selectPublicKeyBtn = 'select-keypair-button';
  disconnectAllKeysBtn = 'disconnect';
  walletInputError = 'input-wallet-error';
  walletFormError = 'form-error';
  inputError = 'input-error-text';
  connectNetworkBtn = 'connect-network';

  openVegaWalletConnectDialog() {
    this.clickOnWalletConnectDialog();
    cy.contains('Connects using REST to a running Vega wallet service');
    cy.getByTestId(this.walletConnectors).find('button').click();
  }

  fillInWalletForm(walletName: string, walletPassphrase: string) {
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
    cy.getByTestId(this.walletForm)
      .find('button[type=submit]')
      .click({ force: true });
  }

  validateWalletNotRunningError() {
    cy.getByTestId(this.walletFormError).should(
      'have.text',
      'Authentication failed'
    );
  }

  validateWalletErrorFieldsDisplayed() {
    cy.getByTestId(this.walletInputError).should('have.text', 'Required');
    cy.getByTestId(this.inputError).should('have.text', 'Required');
  }

  validatePublicKeyDisplayed(expectedTruncatedKey: string) {
    cy.getByTestId(this.connectVegaBtn).should(
      'have.text',
      expectedTruncatedKey
    );
  }

  validateWalletConnected() {
    cy.getByTestId(this.connectVegaBtn).should('contain.text', '…');
  }

  selectPublicKey() {
    cy.getByTestId(this.selectPublicKeyBtn).first().click();
  }

  clickOnWalletConnectDialog() {
    cy.getByTestId(this.connectVegaBtn).click({ force: true });
  }

  clickDisconnectAllKeys() {
    cy.getByTestId(this.disconnectAllKeysBtn).click();
  }
}
