export default class TradesList {
  colIdPrice = 'price';
  colIdSize = 'size';
  colIdCreatedAt = 'createdAt';

  verifyTradesListDisplayed() {
    cy.get(`[col-id=${this.colIdPrice}]`).each(($tradePrice) => {
      cy.wrap($tradePrice).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id=${this.colIdSize}]`).each(($tradeSize) => {
      cy.wrap($tradeSize).invoke('text').should('not.be.empty');
    });

    const dateTimeRegex =
      /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/gm;
    cy.get(`[col-id=${this.colIdCreatedAt}]`).each(($tradeDateTime, index) => {
      if (index != 0) {
        //ignore header
        cy.wrap($tradeDateTime).invoke('text').should('match', dateTimeRegex);
      }
    });
  }
}
