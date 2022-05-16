export default class BasePage {
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';
  switchThemeBtn = 'theme-switcher';

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

  switchToDarkMode() {
    cy.get('body').then(($body) => {
      if ($body.find('[data-theme=dark]').length) {
        cy.log('App already in dark mode');
      } else {
        cy.log('Switching to dark mode');
        cy.getByTestId(this.switchThemeBtn).click();
      }
    });
  }
}
