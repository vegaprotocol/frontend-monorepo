export default class OrdersList {
  orderSymbol = 'market.tradableInstrument.instrument.code';
  orderSize = 'size';
  orderType = 'type';
  orderStatus = 'status';
  orderRemaining = 'remaining';
  orderPrice = 'price';
  orderTimeInForce = 'timeInForce';
  orderCreatedAt = 'createdAt';

  verifyOrdersDisplayed() {
    cy.get(`[col-id='${this.orderSymbol}']`).each(($symbol) => {
      cy.wrap($symbol).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderSize}']`).each(($size) => {
      cy.wrap($size).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderType}']`).each(($type) => {
      cy.wrap($type).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderStatus}']`).each(($status) => {
      cy.wrap($status).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderRemaining}']`).each(($remaining) => {
      cy.wrap($remaining).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderPrice}']`).each(($price) => {
      cy.wrap($price).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderTimeInForce}']`).each(($timeInForce) => {
      cy.wrap($timeInForce).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.orderCreatedAt}']`).each(($dateTime) => {
      cy.wrap($dateTime).invoke('text').should('not.be.empty');
    });
  }
}
