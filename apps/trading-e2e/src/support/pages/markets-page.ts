import BasePage from './base-page';

export default class MarketPage extends BasePage {
  marketRowHeaderClassname = 'div > span.ag-header-cell-text';
  marketRowNameColumn = 'tradableInstrument.instrument.code';
  marketRowSymbolColumn =
    'tradableInstrument.instrument.product.settlementAsset.symbol';
  marketRowPrices = 'flash-cell';
  marketRowDescription = 'name';
  marketStateColId = 'data';
  openMarketMenu = 'arrow-down';

  validateMarketsAreDisplayed() {
    // We need this to ensure that ag-grid is fully rendered before asserting
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.ag-root-wrapper').should('be.visible');
  }

  validateMarketTableDisplayed() {
    const expectedMarketHeaders = [
      'Market',
      'Settlement asset',
      'State',
      'Best bid',
      'Best offer',
      'Mark price',
      'Description',
    ];

    for (let index = 0; index < expectedMarketHeaders.length; index++) {
      cy.get(this.marketRowHeaderClassname).should(
        'contain.text',
        expectedMarketHeaders[index]
      );
    }

    cy.get(`[col-id='${this.marketRowNameColumn}']`).each(($marketName) => {
      cy.wrap($marketName).should('not.be.empty');
    });

    cy.get(`[col-id='${this.marketRowSymbolColumn}']`).each(($marketSymbol) => {
      cy.wrap($marketSymbol).should('not.be.empty');
    });

    cy.getByTestId(this.marketRowPrices).each(($price) => {
      cy.wrap($price).should('not.be.empty').and('contain.text', '.');
    });

    cy.get(`[col-id='${this.marketRowDescription}']`).each(
      ($marketDescription) => {
        cy.wrap($marketDescription).should('not.be.empty');
      }
    );
  }

  clickOnMarket(text: string) {
    cy.get(`[col-id=${this.marketStateColId}]`).should('be.visible');
    cy.get(`[col-id=${this.marketStateColId}]`).contains(text).click();
  }

  clickOpenMarketMenu() {
    cy.getByTestId(this.openMarketMenu).click();
  }
}
