export default class OrderBookList {
  cumulativeVolBidBar = 'bid-bar';
  cumulativeVolAskBar = 'ask-bar';
  precisionChange = 'precision-change';
  bidColour = 'darkgreen';
  askColour = 'maroon';
  testingVolume = TestingVolumeType;

  bidVolTestId(price: string) {
    return `bid-vol-${price}`;
  }
  priceTestId(price: string) {
    return `price-${price}`;
  }
  askVolTestId(price: string) {
    return `ask-vol-${price}`;
  }
  cumulativeVolTestId(price: string) {
    return `cumulative-vol-${price}`;
  }

  verifyOrderBookDisplayed(price: string) {
    cy.getByTestId(this.bidVolTestId(price)).should('not.be.empty');
    cy.getByTestId(this.priceTestId(price))
      .invoke('text')
      .then(($priceText) => {
        $priceText = $priceText.replace('.', '');
        expect($priceText).to.equal(price);
      });
    cy.getByTestId(this.askVolTestId(price)).should('not.be.empty');
    cy.getByTestId(this.cumulativeVolTestId(price)).should('not.be.empty');
  }

  verifyOrderBookRow(
    price: string,
    expectedBidVol: string,
    expectedPrice: string,
    expectedAskVol: string,
    expectedCumulativeVol: string
  ) {
    cy.getByTestId(this.bidVolTestId(price)).should(
      'have.text',
      expectedBidVol
    );
    cy.getByTestId(this.priceTestId(price)).should('have.text', expectedPrice);
    cy.getByTestId(this.askVolTestId(price)).should(
      'have.text',
      expectedAskVol
    );
    cy.getByTestId(this.cumulativeVolTestId(price)).should(
      'have.text',
      expectedCumulativeVol
    );
  }

  // Value should be 1, 10 or 100
  changePrecision(precisionValue: string) {
    cy.getByTestId(this.precisionChange).select(precisionValue);
  }

  verifyDisplayedVolume(
    price: string,
    isBuy: boolean,
    expectedPercentage: string,
    volumeType: TestingVolumeType
  ) {
    let expectedColour = '';
    let testId = '';

    if (isBuy == true) {
      expectedColour = this.bidColour;
    } else {
      expectedColour = this.askColour;
    }

    switch (volumeType) {
      case TestingVolumeType.BidVolume:
        testId = `[data-testid=${this.bidVolTestId(price)}]`;
        break;

      case TestingVolumeType.AskVolume:
        testId = `[data-testid=${this.askVolTestId(price)}]`;
        break;

      case TestingVolumeType.CumulativeVolume:
        testId = `[data-testid=${this.cumulativeVolTestId(price)}]`;
        break;
    }

    cy.get(`${testId} > div`)
      .invoke('attr', 'style')
      .should('contain', `width: ${expectedPercentage}`)
      .should('contain', `background-color: ${expectedColour}`);
  }

  verifyCumulativeAskBarPercentage(expectedPercentage: string) {
    cy.getByTestId(this.cumulativeVolAskBar)
      .invoke('attr', 'style')
      .should('contain', `width: ${expectedPercentage}`)
      .should('contain', `background-color: ${this.askColour}`);
  }

  verifyCumulativeBidBarPercentage(expectedPercentage: string) {
    cy.getByTestId(this.cumulativeVolBidBar)
      .invoke('attr', 'style')
      .should('contain', `width: ${expectedPercentage}`)
      .should('contain', `background-color: ${this.bidColour}`);
  }
}

enum TestingVolumeType {
  BidVolume = 'BidVolume',
  AskVolume = 'AskVolume',
  CumulativeVolume = 'CumulativeVolume',
}
