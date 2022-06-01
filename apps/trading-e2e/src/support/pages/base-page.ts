export default class BasePage {
  closeDialogBtn = 'dialog-close';
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';
  assetSelectField = 'select[name="asset"]';
  toAddressField = 'input[name="to"]';
  amountField = 'input[name="amount"]';
  formFieldError = 'input-error-text';
  dialogHeader = 'dialog-title';
  dialogText = 'dialog-text';

  closeDialog() {
    cy.getByTestId(this.closeDialogBtn, { timeout: 8000 }).click({
      force: true,
    });
  }

  navigateToPortfolio() {
    cy.get(`a[href='${this.porfolioUrl}']`)
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/portfolio');
    cy.getByTestId('portfolio');
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`)
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/markets');
    cy.getByTestId('markets');
  }

  verifyFormErrorDisplayed(expectedError: string, expectedNumErrors: number) {
    cy.getByTestId(this.formFieldError).should('contain.text', expectedError);
    cy.getByTestId(this.formFieldError).should(
      'have.length',
      expectedNumErrors
    );
  }

  updateTransactionform(args?: {
    asset?: string;
    to?: string;
    amount?: string;
  }) {
    if (args?.asset) {
      cy.get(this.assetSelectField).select(args.asset);
    }
    if (args?.to) {
      cy.get(this.toAddressField).clear().type(args.to);
    }
    if (args?.amount) {
      cy.get(this.amountField).clear().type(args.amount);
    }
  }
}
