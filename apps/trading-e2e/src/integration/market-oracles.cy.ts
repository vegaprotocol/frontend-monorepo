import { MarketState } from '@vegaprotocol/types';

describe('market oracle', { tags: '@smoke' }, () => {
  it('current fees displayed', () => {
    cy.mockTradingPage(
      MarketState.STATE_ACTIVE,
      undefined,
      undefined,
      'COMPROMISED'
    );
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
    cy.wait('@MarketInfo');
    cy.getByTestId('oracle-status').should('contain.text', 'COMPROMISED');
  });
});
