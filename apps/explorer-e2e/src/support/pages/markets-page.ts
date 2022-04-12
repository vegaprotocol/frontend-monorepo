import BasePage from './base-page';

export default class MarketsPage extends BasePage {
  marketHeaders = 'markets-header';

  validateMarketDataDisplayed() {
    this.validateBlockDataDisplayed(this.marketHeaders);
  }
}
