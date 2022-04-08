import BasePage from './base-page';

export default class MarketPage extends BasePage {
  marketRowHeaderClassname = '.ag-header-cell-text';
  marketRowNameColumn = 'tradableInstrument.instrument.code';
  marketRowSymbolColumn =
    'tradableInstrument.instrument.product.settlementAsset.symbol';
  marketRowPrices = 'flash-cell';
  marketRowDescription = 'name';
  chartTab = 'chart';
  ticketTab = 'ticket';
  orderbookTab = 'orderbook';
  ordersTab = 'orders';
  positionsTab = 'positions';
  collateralTab = 'collateral';
  tradesTab = 'trades';
  completedTrades = 'market-trades';
  orderBookTab = 'orderbook';

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

    cy.get(this.marketRowHeaderClassname)
      .each(($marketHeader, index) => {
        cy.wrap($marketHeader).should(
          'have.text',
          expectedMarketHeaders[index]
        );
      })
      .then(($list) => {
        cy.wrap($list).should('have.length', 7);
      });

    cy.get(`[col-id='${this.marketRowNameColumn}']`).each(($marketName) => {
      cy.wrap($marketName).should('not.be.empty');
    });

    cy.get(`[col-id='${this.marketRowSymbolColumn}']`).each(($marketName) => {
      cy.wrap($marketName).should('not.be.empty');
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

  validateCompletedTradesDisplayed() {
    cy.getByTestId(this.completedTrades).should('not.be.empty');
  }

  clickOnMarket(marketText) {
    cy.contains(marketText).click();
  }

  clickOnActiveMarket() {
    cy.contains('Active', { timeout: 8000 }).click({ force: true });
  }

  clickOnTopMarketRow() {
    cy.get('[col-id="data"]').eq(1).click();
  }

  clickOnOrdersTab() {
    cy.getByTestId(this.ordersTab).click();
  }

  clickOnTicketTab() {
    cy.getByTestId(this.ticketTab).click();
  }

  clickOnCollateralTab() {
    cy.getByTestId(this.collateralTab).click();
  }

  clickOnTradesTab() {
    cy.getByTestId(this.tradesTab).click();
  }

  clickOrderBookTab() {
    cy.getByTestId(this.orderBookTab).click();
  }
}
