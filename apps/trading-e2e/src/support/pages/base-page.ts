export default class BasePage {
  closeDialogBtn = 'dialog-close';
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';

  closeDialog() {
    cy.getByTestId(this.closeDialogBtn).click();
  }

  navigateToPortfolio() {
    cy.get(`a[href='${this.porfolioUrl}']`).should('be.visible').click();
    cy.url().should('include', '/portfolio');
    cy.getByTestId('portfolio');
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`).should('be.visible').click();
    cy.url().should('include', '/markets');
    cy.getByTestId('markets');
  }
}
