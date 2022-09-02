import { aliasQuery } from '@vegaprotocol/cypress';
import { MarketState } from '@vegaprotocol/types';
import { generateMarkets } from '../support/mocks/generate-markets';
import { mockTradingPage } from '../support/trading';

describe('home', () => {
  const selectMarketOverlay = 'select-market-list';

  describe('default market found', () => {
    beforeEach(() => {
      // Mock markets query that is triggered by home page to find default market
      cy.mockGQL((req) => {
        aliasQuery(req, 'MarketList', generateMarkets());

        // Mock all market page queries
        mockTradingPage(req, MarketState.STATE_ACTIVE);
      });

      cy.visit('/');
      cy.contains('Loading...').should('be.visible');
      cy.contains('Loading...').should('not.exist');

      cy.get('main[data-testid="market"]', { timeout: 20000 }).should('exist'); // Wait for page to be rendered to before checking url
    });

    it.skip('redirects to a default market with the landing dialog open', () => {
      // Overlay should be shown
      cy.getByTestId(selectMarketOverlay).should('exist');
      cy.contains('Select a market to get started').should('be.visible');

      // I expect the market overlay table to contain at least 3 rows (one header row)
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .then((row) => {
          expect(row.length >= 3).to.be.true;
        });

      // each market shown in overlay table contains content under the last price and change fields
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .each(($element, index) => {
          if (index > 0) {
            // skip header row
            cy.root().within(() => {
              cy.getByTestId('price').should('not.be.empty');
            });
          }
        });

      cy.getByTestId('dialog-close').click();
      cy.getByTestId(selectMarketOverlay).should('not.exist');

      // the choose market overlay is no longer showing
      cy.contains('Select a market to get started').should('not.exist');
      cy.contains('Loading...').should('not.exist');
    });
  });

  describe('no default found', () => {
    it('redirects to a the market list page if no sensible default is found', () => {
      // Mock markets query that is triggered by home page to find default market
      cy.mockGQL((req) => {
        aliasQuery(req, 'MarketList', { markets: [] });

        // Mock all market page queries
        mockTradingPage(req, MarketState.STATE_ACTIVE);
      });

      cy.visit('/');
      cy.url().should('eq', Cypress.config().baseUrl + '/markets');
    });
  });
});
