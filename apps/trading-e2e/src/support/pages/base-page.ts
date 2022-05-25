export default class BasePage {
  closeDialogBtn = 'dialog-close';
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';

  closeDialog() {
    cy.getByTestId(this.closeDialogBtn, { timeout: 8000 }).click({
      force: true,
    });
  }

  navigateToPortfolio() {
    cy.get(`a[href='${this.porfolioUrl}']`).should('be.visible').click({force:true});
    cy.url().should('include', '/portfolio');
    cy.getByTestId('portfolio');
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`).first().should('be.visible').click({force:true});
    cy.url().should('include', '/markets');
    cy.getByTestId('markets');
  }
}
