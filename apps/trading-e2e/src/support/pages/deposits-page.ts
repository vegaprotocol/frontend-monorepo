import BasePage from './base-page';

export default class DepositsPage extends BasePage {
  navigateToDeposits() {
    cy.visit('/portfolio');
    cy.get(`a[href='/portfolio/deposit']`).click();
    cy.url().should('include', '/portfolio/deposit');
  }
}
