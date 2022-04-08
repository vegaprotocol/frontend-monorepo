export default class BasePage {
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';

  navigateToPortfolio() {
    cy.get(`a[href='${this.porfolioUrl}']`).click();
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`)
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', '/markets');
  }
}
