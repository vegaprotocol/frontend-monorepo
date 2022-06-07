import BasePage from './base-page';

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

  getOpenMarketCodes(openMarkets: []) {
    const openMarketCodes: string[] = [];
    openMarkets.forEach((market: []) => {
      openMarketCodes.push(market.tradableInstrument.instrument.code);
    });
    return cy.wrap(openMarketCodes);
  }

  getOldestTradableInstrument(openMarkets: []) {
    let currentOldestTime = 9999999999999;
    let oldestMarketInstrument;
    openMarkets.forEach((market: []) => {
      const epochTimestamp = Date.parse(market.marketTimestamps.open);
      if (epochTimestamp < currentOldestTime) {
        currentOldestTime = epochTimestamp;
        oldestMarketInstrument = market.tradableInstrument;
      }
    });
    return cy.wrap(oldestMarketInstrument);
  }

  getMostRecentTradableInstrument(openMarkets: []) {
    let currentNewTime = 0;
    let mostRecentMarketInstrument;
    openMarkets.forEach((market: []) => {
      const epochTimestamp = Date.parse(market.marketTimestamps.open);
      if (epochTimestamp > currentNewTime) {
        currentNewTime = epochTimestamp;
        mostRecentMarketInstrument = market.tradableInstrument;
      }
    });
    return cy.wrap(mostRecentMarketInstrument);
  }

  validateTableCodesExistOnServer(openMarketCodes: []) {
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
        cy.get($element).within(() => {
          cy.getByTestId('price').should('not.be.empty');
        });
      }
    });
  }
}
