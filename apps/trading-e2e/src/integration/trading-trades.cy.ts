import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.visit('/markets/market-0');
});

describe('trades', () => {
  const colIdPrice = 'price';
  const colIdSize = 'size';
  const colIdCreatedAt = 'createdAt';

  it('renders trades', () => {
    cy.getByTestId('Trades').click();
    cy.getByTestId('tab-trades').should('be.visible');

    cy.get(`[col-id=${colIdPrice}]`).each(($tradePrice) => {
      cy.wrap($tradePrice).invoke('text').should('not.be.empty');
    });
    cy.get(`[col-id=${colIdSize}]`).each(($tradeSize) => {
      cy.wrap($tradeSize).invoke('text').should('not.be.empty');
    });

    const dateTimeRegex =
      /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;
    cy.get(`[col-id=${colIdCreatedAt}]`).each(($tradeDateTime, index) => {
      if (index != 0) {
        //ignore header
        cy.wrap($tradeDateTime).invoke('text').should('match', dateTimeRegex);
      }
    });
  });
});
