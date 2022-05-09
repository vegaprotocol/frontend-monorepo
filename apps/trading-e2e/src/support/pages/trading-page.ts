import BasePage from './base-page';

export default class TradingPage extends BasePage {
  chartTab = 'Chart';
  ticketTab = 'Ticket';
  orderbookTab = 'Orderbook';
  ordersTab = 'Orders';
  positionsTab = 'Positions';
  accountsTab = 'Accounts';
  collateralTab = 'Collateral';
  tradesTab = 'Trades';
  completedTrades = 'Market-trades';
  orderBookTab = 'Prderbook';
  candleChartClassName = '.plot-area-interaction';

  clickOnOrdersTab() {
    cy.getByTestId(this.ordersTab).click();
  }

  clickOnAccountsTab() {
    cy.getByTestId(this.accountsTab).click();
  }

  clickOnPositionsTab() {
    cy.getByTestId(this.positionsTab).click();
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

  validateCandleChartDisplayed() {
    cy.get(this.candleChartClassName).matchImageSnapshot('candle-chart');
  }
}
