import BasePage from './base-page';

export default class WithdrawalsPage extends BasePage {
  useConnectedEthWallet = 'use-connected';
  useMaximumAmount = 'use-maximum';
  submitBtn = 'submit-withdrawal';
  connectVegaWalletText = 'connect-vega-wallet-text';
  assetSymbolColId = 'asset.symbol';
  amountColId = 'amount';
  recipientColdId = 'details.receiverAddress';
  createdAtTimeStampId = 'createdTimestamp';
  statusColId = 'status';
  etherScanLink = 'etherscan-link';

  navigateToWithdrawal() {
    cy.visit('/');
    this.navigateToPortfolio();
    cy.get(`a[href='/portfolio/deposit']`).click();
    cy.url().should('include', '/portfolio/deposit');
    cy.getByTestId('deposit-form').should('be.visible');
  }

  clearEthereumAddress() {
    cy.get(this.toAddressField).clear();
  }

  clickUseConnected() {
    cy.getByTestId(this.useConnectedEthWallet).click();
  }

  clickUseMaximum() {
    cy.getByTestId(this.useMaximumAmount).click();
  }

  clickSubmit() {
    cy.getByTestId(this.submitBtn).click();
  }

  validateConnectWalletText() {
    cy.getByTestId(this.connectVegaWalletText).should(
      'have.text',
      'Please connect your Vega wallet'
    );
  }

  validateTestWalletEthWalletAddress() {
    cy.get(this.toAddressField).should(
      'have.value',
      Cypress.env('ETHEREUM_WALLET_ADDRESS')
    );
  }

  validateAmount(expectedAmount: string) {
    cy.get(this.amountField).should('have.value', expectedAmount);
  }

  validateConfirmWithdrawalModal() {
    cy.getByTestId(this.dialogHeader).should('have.text', 'Confirm withdrawal');
    cy.getByTestId(this.dialogText).should(
      'have.text',
      'Confirm withdrawal in Vega wallet'
    );
  }

  validateWithdrawalAssetDisplayed(assetSymbol: string) {
    cy.get(`[col-id="${this.assetSymbolColId}"]`).should(
      'contain.text',
      assetSymbol
    );
  }

  validateWithdrawalAmountDisplayed(amount: string) {
    cy.get(`[col-id="${this.amountColId}"]`).should('contain.text', amount);
  }

  validateWithdrawalRecipientDisplayed(
    truncatedEthAddress: string,
    ethAddressLink: string
  ) {
    cy.get(`[col-id="${this.recipientColdId}"]`)
      .should('contain.text', truncatedEthAddress)
      .find(`[data-testid=${this.etherScanLink}]`)
      .should('have.attr', 'href', ethAddressLink);
  }

  validateWithdrawalDateDisplayed() {
    cy.get(`[col-id="${this.createdAtTimeStampId}"]`)
      .invoke('text')
      .should('not.be.empty');
  }

  validateWithdrawalStatusDisplayed(status: string) {
    cy.get(`[col-id="${this.statusColId}"]`).should('contain.text', status);
  }

  validateEtherScanLinkDisplayed(txlink: string) {
    cy.getByTestId(this.etherScanLink)
      .last()
      .should('have.text', 'View on Etherscan')
      .and('have.attr', 'href', txlink);
  }
}
