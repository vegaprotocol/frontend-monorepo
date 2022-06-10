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
    return openMarketCodes;
  }

  getOldestOpenMarket(openMarkets: OpenMarketType[]) {
    const [oldestMarket] = openMarkets.sort(
      (a, b) =>
        new Date(a.marketTimestamps.open).getTime() -
        new Date(b.marketTimestamps.open).getTime()
    );
    if (!oldestMarket) {
      throw new Error('Could not find oldest market');
    }
    return oldestMarket;
  }

  getMostRecentOpenMarket(openMarkets: OpenMarketType[]) {
    const [recentMarket] = openMarkets.sort(
      (b, a) =>
        new Date(a.marketTimestamps.open).getTime() -
        new Date(b.marketTimestamps.open).getTime()
    );
    if (!recentMarket) {
      throw new Error('Could not find most recent market');
    }
    return recentMarket;
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
