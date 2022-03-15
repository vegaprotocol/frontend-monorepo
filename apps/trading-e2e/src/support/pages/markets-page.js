import BasePage from './base-page';

export default class MarketPage extends BasePage {
  marketRow = 'market-row';
  chartTab = 'chart';
  ticketTab = 'ticket';
  orderbookTab = 'orderbook';
  ordersTab = 'orders';
  positionsTab = 'positions';
  collateralTab = 'collateral';

  validateMarketsAreDisplayed() {
    cy.getByTestId(this.marketRow).should('have.length.above', 0);
  }

  clickOnMarket(marketSymbol) {
    cy.getByTestId(this.marketRow).contains(marketSymbol).click();
  }

  clickOnTicketTab() {
    cy.getByTestId(this.ticketTab).click();
  }
}
