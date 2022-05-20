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
    cy.getByTestId('deposit-form').should('be.visible');
  }

  verifyFormDisplayed() {
    cy.getByTestId('deposit-form').should('be.visible');
  }

  checkModalContains(text: string) {
    cy.get('[role="dialog"] > div > div > h1').should('have.text', text);
  }

  updateForm(args?: { asset?: string; to?: string; amount?: string }) {
    if (args?.asset) {
      cy.get('select[name="asset"]').select(args.asset);
    }
    if (args?.to) {
      cy.get('input[name="to"]').clear().type(args.to);
    }
    if (args?.amount) {
      cy.get('input[name="amount"]').clear().type(args.amount);
    }
  }

  submitForm() {
    cy.getByTestId('deposit-submit').click();
  }

  verifyFieldsAreRequired() {
    cy.get(this.assetError).contains(this.requiredText);
    cy.get(this.toError).contains(this.requiredText);
    cy.get(this.amountError).contains(this.requiredText);
    cy.getByTestId('input-error-text').should('have.length', 3);
  }

  verifyInvalidPublicKey() {
    cy.get(this.toError).should('have.text', 'Invalid Vega key');
  }

  verifyAmountTooSmall() {
    cy.get(this.amountError).should('have.text', 'Value is below minimum');
  }

  verifyInsufficientAmountMessage() {
    cy.getByTestId('input-error-text').should(
      'contain.text',
      'Insufficient amount in Ethereum wallet'
    );
  }

  verifyNotApproved() {
    cy.get(this.amountError).should(
      'have.text',
      'Amount is above approved amount'
    );
    cy.contains('Deposits of tBTC not approved').should('be.visible');
  }
}
