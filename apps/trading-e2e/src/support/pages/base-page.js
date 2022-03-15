export default class BasePage {
  porfolioUrl = '/portfolio';
  marketsUrl = '/markets';

  navigateToPortfolio() {
    cy.get(`a[href='${this.porfolioUrl}']`).click();
  }

  navigateToMarkets() {
    cy.get(`a[href='${this.marketsUrl}']`).click();
  }

  isElementSelected(selectableElement) {
    cy.get('body').then(($body) => {
      if ($body.find(`[data-testid=${selectableElement}-selected]`).length) {
        return true;
      } else return false;
    });
  }
}
