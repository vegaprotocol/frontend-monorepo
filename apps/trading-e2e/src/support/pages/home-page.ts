import BasePage from './base-page';
import type { OpenMarketType } from '../step_definitions/home-page.step';

export default class HomePage extends BasePage {
  validateStringIsDisplayedAtTopOfTable(value: string) {
    // Ignore header row
    cy.get('table tr')
      .eq(1)
      .within(() => cy.contains(value).should('be.visible'));
  }

  getOpenMarketsFromServer() {
    const query = `{markets{marketTimestamps{open},tradableInstrument{instrument{code,name}}}}`;
    return cy
      .request({
        method: 'POST',
        url: `https://lb.testnet.vega.xyz/query`,
        body: { query },
        headers: { 'content-type': 'application/json' },
      })
      .its('body.data.markets');
  }

  getOpenMarketCodes(openMarkets: OpenMarketType[]) {
    const openMarketCodes: string[] = [];
    openMarkets.forEach((market: OpenMarketType) => {
      openMarketCodes.push(market.tradableInstrument.instrument.code);
    });
    return cy.wrap(openMarketCodes);
  }

  getOldestOpenMarket(openMarkets: OpenMarketType[]) {
    let currentOldestTime = 9999999999999;
    let oldestMarket;
    openMarkets.forEach((market: OpenMarketType) => {
      const marketTime = Date.parse(market.marketTimestamps.open);
      if (marketTime < currentOldestTime) {
        currentOldestTime = marketTime;
        oldestMarket = market;
      }
    });
    return cy.wrap(oldestMarket);
  }

  getMostRecentOpenMarket(openMarkets: OpenMarketType[]) {
    let currentNewTime = 0;
    let mostRecentMarket;
    openMarkets.forEach((market: OpenMarketType) => {
      const marketTime = Date.parse(market.marketTimestamps.open);
      if (marketTime > currentNewTime) {
        currentNewTime = marketTime;
        mostRecentMarket = market;
      }
    });
    return cy.wrap(mostRecentMarket);
  }

  validateTableCodesExistOnServer(openMarketCodes: string[]) {
    cy.get('table tr', { timeout: 12000 }).each(($element, index) => {
      if (index > 0) {
        // skip header row
        const openMarketCodeText: string = $element.children().first().text();
        assert.include(
          openMarketCodes,
          openMarketCodeText,
          `Checking ${openMarketCodeText} is shown within server open markets response`
        );
      }
    });
  }

  validateTableContainsLastPriceAndChange() {
    cy.get('table tr').each(($element, index) => {
      if (index > 0) {
        // skip header row
        cy.root().within(() => {
          cy.getByTestId('price').should('not.be.empty');
        });
      }
    });
  }
}
