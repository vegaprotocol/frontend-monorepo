import { MarketState } from '@vegaprotocol/types';
import { hasOperationName } from '../support';
import { generateMarketList } from '../support/mocks/generate-market-list';
import { generateMarkets } from '../support/mocks/generate-markets';
import { generateMarketsLanding } from '../support/mocks/generate-markets-landing';
import { mockTradingPage } from '../support/trading';

describe('home', () => {
  it('redirects to a default market with the landing dialog open', () => {
    // Mock markets query that is triggered by home page to find default market
    cy.mockGQL('MarketsLanding', (req) => {
      if (hasOperationName(req, 'MarketsLanding')) {
        req.reply({
          body: { data: generateMarketsLanding() },
        });
      }
    });

    // Market market list for the dialog that opens on a trading page
    cy.mockGQL('MarketList', (req) => {
      if (hasOperationName(req, 'MarketList')) {
        req.reply({
          body: { data: generateMarketList() },
        });
      }
    });

    // Mock market page
    mockTradingPage(MarketState.Active);

    cy.visit('/');
    cy.wait('@MarketsLanding');
    cy.url().should('include', '/markets/market-0');
    cy.wait('@MarketList');
    cy.getByTestId('select-market-list').should('exist');
    cy.getByTestId('dialog-close').click();
    cy.getByTestId('select-market-list').should('not.exist');
  });

  it('redirects to a the market list page if no sensible default is found', () => {
    // Mock markets query that is triggered by home page to find default market
    cy.mockGQL('MarketsLanding', (req) => {
      if (hasOperationName(req, 'MarketsLanding')) {
        req.reply({
          body: {
            // Remove open timestamps so we can't calculate a sensible default market
            data: generateMarketsLanding({
              markets: [
                {
                  marketTimestamps: {
                    open: '',
                  },
                },
                {
                  marketTimestamps: {
                    open: '',
                  },
                },
              ],
            }),
          },
        });
      }
    });

    cy.mockGQL('Markets', (req) => {
      if (hasOperationName(req, 'Markets')) {
        req.reply({
          body: {
            data: generateMarkets(),
          },
        });
      }
    });

    cy.visit('/');
    cy.wait('@MarketsLanding');
    cy.url().should('include', '/markets');
  });
});
