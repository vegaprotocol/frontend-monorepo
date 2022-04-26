export default class PositionsList {
  positionMarketSymbol = 'market.tradableInstrument.instrument.code';
  positionOpenVolume = 'openVolume';
  positionPrices = 'flash-cell';

  verifyPositionsDisplayed() {
    cy.get(`[col-id='${this.positionMarketSymbol}']`).each(($marketSymbol) => {
      cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id='${this.positionOpenVolume}']`).each(($openVolume) => {
      cy.wrap($openVolume).invoke('text').should('not.be.empty');
    });
    // includes average entry price, mark price & realised PNL
    cy.getByTestId(this.positionPrices).each(($prices) => {
      cy.wrap($prices).invoke('text').should('not.be.empty');
    });
  }
}
