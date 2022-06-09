import { MarketState } from '@vegaprotocol/types';
import { hasOperationName } from '../support';
import { generateAccounts } from '../support/mocks/generate-accounts';
import { generateCandles } from '../support/mocks/generate-candles';
import { generateChart } from '../support/mocks/generate-chart';
import { generateDealTicketQuery } from '../support/mocks/generate-deal-ticket-query';
import { generateMarket } from '../support/mocks/generate-market';
import { generateMarketList } from '../support/mocks/generate-market-list';
import { generateMarkets } from '../support/mocks/generate-markets';
import { generateMarketsLanding } from '../support/mocks/generate-markets-landing';
import { generateOrders } from '../support/mocks/generate-orders';
import { generatePositions } from '../support/mocks/generate-positions';
import { generateTrades } from '../support/mocks/generate-trades';

const mockMarket = (state: MarketState) => {
  cy.mockGQL('Market', (req) => {
    if (hasOperationName(req, 'Market')) {
      req.reply({
        body: {
          data: generateMarket({
            market: {
              name: `${state.toUpperCase()} MARKET`,
            },
          }),
        },
      });
    }

    if (hasOperationName(req, 'Orders')) {
      req.reply({
        body: { data: generateOrders() },
      });
    }

    if (hasOperationName(req, 'Accounts')) {
      req.reply({
        body: {
          data: generateAccounts(),
        },
      });
    }

    if (hasOperationName(req, 'Positions')) {
      req.reply({
        body: { data: generatePositions() },
      });
    }

    if (hasOperationName(req, 'DealTicketQuery')) {
      req.reply({
        body: { data: generateDealTicketQuery({ market: { state } }) },
      });
    }

    if (hasOperationName(req, 'Trades')) {
      req.reply({
        body: { data: generateTrades() },
      });
    }

    if (hasOperationName(req, 'Chart')) {
      req.reply({
        body: { data: generateChart() },
      });
    }

    if (hasOperationName(req, 'Candles')) {
      req.reply({
        body: { data: generateCandles() },
      });
    }
  });
};

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
    mockMarket(MarketState.Active);

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
