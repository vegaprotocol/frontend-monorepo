export default class OrderBookList {
  zoomOutBtn = 'order-book-zoom-out';
  zoomInBtn = 'order-book-zoom-in';
  volumeCell = 'vol';
  priceCell = 'price';

  verifyMockedOrderBookDisplayed(expectedLength: number) {
    cy.getByTestId(this.volumeCell)
      .should('have.length', expectedLength)
      .each(($cell) => {
        cy.wrap($cell).should('not.be.empty');
      });
  }

  clickZoomOut() {
    cy.getByTestId(this.zoomOutBtn).click();
  }

  clickZoomIn() {
    cy.getByTestId(this.zoomInBtn).click();
  }

  verifyCumulativeVolume(
    isBuy: boolean,
    volume: number,
    expectedPercentage: string
  ) {
    let expectedColour = '';

    if (isBuy == true) {
      expectedColour = 'darkgreen';
    } else {
      expectedColour = 'maroon';
    }
    // cy.get(volume.toString())
    cy.get(`[data-testid=${this.volumeCell}] > div`)
      .eq(1)
      .invoke('attr', 'style')
      .should('contain', `width: ${expectedPercentage}`)
      .should('contain', `background-color: ${expectedColour}`);
  }
}
