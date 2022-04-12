import BasePage from './base-page';

export default class TradingPage extends BasePage {
  chartTab = 'chart';
  ticketTab = 'ticket';
  orderbookTab = 'orderbook';
  ordersTab = 'orders';
  positionsTab = 'positions';
  collateralTab = 'collateral';
  tradesTab = 'trades';
  completedTrades = 'market-trades';
  orderBookTab = 'orderbook';

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
