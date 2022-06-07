export default class BasePage {
  closeDialogBtn = 'dialog-close';
  portfolioUrl = '/portfolio';
  marketsUrl = '/markets';
  assetSelectField = 'select[name="asset"]';
  toAddressField = 'input[name="to"]';
  amountField = 'input[name="amount"]';
  formFieldError = 'input-error-text';
  dialogHeader = 'dialog-title';
  dialogText = 'dialog-text';

  closeDialog() {
    cy.getByTestId(this.closeDialogBtn, { timeout: 8000 })?.click({
      force: true,
    });
  }

  navigateToPortfolio() {
    cy.get(`a[href='${this.portfolioUrl}']`)
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/portfolio');
    cy.getByTestId('portfolio');
  }

  navigateToMarkets() {
    cy.getByTestId('markets-link').should('be.visible').click({ force: true });
    cy.url().should('include', '/markets');
  }

  verifyFormErrorDisplayed(expectedError: string, expectedNumErrors: number) {
    cy.getByTestId(this.formFieldError).should('contain.text', expectedError);
    cy.getByTestId(this.formFieldError).should(
      'have.length',
      expectedNumErrors
    );
  }

  updateTransactionForm(args?: {
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
