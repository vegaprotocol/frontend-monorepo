import BasePage from './base-page';

export default class MarketPage extends BasePage {
  marketRow = 'market-row';
  chartTab = 'chart';
  ticketTab = 'ticket';
  orderbookTab = 'orderbook';
  ordersTab = 'orders';
  positionsTab = 'positions';
  collateralTab = 'collateral';
  tradesTab = 'trades';
  completedTrades = 'market-trades';
  orderBookTab = 'orderbook';

  validateMarketsAreDisplayed() {
    cy.getByTestId(this.marketRow).should('have.length.above', 0);
  }

  validateCompletedTradesDisplayed() {
    cy.getByTestId(this.completedTrades).should('not.be.empty');
  }

  clickOnMarket(marketText) {
    cy.contains(marketText, { timeout: 8000 }).click({ force: true });
  }

  clickOnActiveMarket() {
    cy.contains('Active', { timeout: 8000 }).click({ force: true });
  }

  clickOnTopMarketRow() {
    cy.get('[col-id="data"]', { timeout: 8000 }).eq(1).click({ force: true });
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
