import BasePage from './base-page';

export default class WithdrawalsPage extends BasePage {
  submitBtn = 'submit-withdrawal'

  navigateToWithdrawal() {
    cy.visit('/');
    this.navigateToPortfolio()
    cy.get(`a[href='/portfolio/deposit']`).click();
    cy.url().should('include', '/portfolio/deposit');
    cy.getByTestId('deposit-form').should('be.visible');
  }

  clearEthereumAddress() {
    cy.get(this.toAddressField).clear()
  }

  clickSubmit() {
    cy.getByTestId(this.submitBtn).click()
  }
}
