import BasePage from './base-page';

export default class DepositsPage extends BasePage {
  requiredText = 'Required';
  assetError = '[role="alert"][aria-describedby="asset"]';
  toError = '[role="alert"][aria-describedby="to"]';
  amountError = '[role="alert"][aria-describedby="amount"]';

  navigateToDeposits() {
    cy.visit('/portfolio');
    cy.get(`a[href='/portfolio/deposit']`).click();
    cy.url().should('include', '/portfolio/deposit');
  }

  verifyFormDisplayed() {
    cy.getByTestId('deposit-form').should('be.visible');
  }

  submitForm(args?: { asset?: string; to?: string; amount?: string }) {
    if (args?.asset) {
      cy.get('select[name="asset"]').select(args.asset);
    }
    if (args?.to) {
      cy.get('input[name="to"]').clear().type(args.to);
    }
    if (args?.amount) {
      cy.get('input[name="amount"]').clear().type(args.amount);
    }
    cy.getByTestId('deposit-submit').click();
  }

  verifyFieldsAreRequired() {
    cy.get(this.assetError).contains(this.requiredText);
    cy.get(this.toError).contains(this.requiredText);
    cy.get(this.amountError).contains(this.requiredText);
    cy.getByTestId('input-error-text').should('have.length', 3);
  }

  verifyInvalidPublicKey() {
    cy.get(this.toError).contains('Invalid Vega key');
  }

  verifyAmountTooSmall() {
    cy.get(this.amountError).contains('Amount is below permitted minimum');
  }

  verifyInsufficientFunds() {
    cy.get(this.amountError).contains('Insufficient amount in Ethereum wallet');
  }
}
