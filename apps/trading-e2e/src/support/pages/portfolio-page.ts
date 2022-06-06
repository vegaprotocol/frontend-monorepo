import BasePage from './base-page';

export default class PortfolioPage extends BasePage {
  deposit = 'deposit';
  depositTEuro = 'deposit-tEuro';
  viewWithdrawals = 'view-withdrawals';
  withdraw = 'withdraw';
  withdrawTEuro = 'withdraw-tEuro';

  navigateToDeposit() {
    cy.getByTestId(this.deposit)
      .should('have.attr', 'href')
      .and('include', '/portfolio/deposit');
    cy.getByTestId(this.deposit).click();
  }

  navigateToDepositTEuro() {
    cy.getByTestId(this.depositTEuro)
      .should('have.attr', 'href')
      .and('include', '/portfolio/deposit?assetId');
    cy.getByTestId(this.depositTEuro).click();
  }

  navigateToWithdrawals() {
    cy.getByTestId(this.viewWithdrawals)
      .should('have.attr', 'href')
      .and('include', '/portfolio/withdrawals');
    cy.getByTestId(this.viewWithdrawals).click();
  }

  navigateToWithdraw() {
    cy.getByTestId(this.withdraw)
      .should('have.attr', 'href')
      .and('include', '/portfolio/withdraw');
    cy.getByTestId(this.withdraw).click();
  }

  navigateToWithdrawTEuro() {
    cy.getByTestId(this.withdrawTEuro)
      .should('have.attr', 'href')
      .and('include', '/portfolio/withdraw?assetId');
    cy.getByTestId(this.withdrawTEuro).click();
  }
}
