import BasePage from './base-page';

export default class DepositsPage extends BasePage {
  requiredText = 'Required';
  assetError = '[role="alert"][aria-describedby="asset"]';
  toError = '[role="alert"][aria-describedby="to"]';
  amountError = '[role="alert"][aria-describedby="amount"]';
  depositSubmitBtn = 'deposit-submit'
  depositApproveSubmitBtn = 'deposit-approve-submit'

  navigateToDeposits() {
    cy.visit('/portfolio/deposit');
    cy.url().should('include', '/portfolio/deposit');
    cy.getByTestId('deposit-form').should('be.visible');
  }

  verifyFormDisplayed() {
    cy.getByTestId('deposit-form').should('be.visible');
  }

  checkModalContains(text: string) {
    cy.get('[role="dialog"] > div > div > h1').should('have.text', text);
  }

  clickDepositSubmit() {
    cy.getByTestId(this.depositSubmitBtn).click();
  }

  clickDepositApproveSubmit() {
    cy.getByTestId(this.depositApproveSubmitBtn).click();
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
