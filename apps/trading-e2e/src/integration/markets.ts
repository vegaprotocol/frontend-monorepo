import { MarketState } from '@vegaprotocol/types';
import { hasOperationName } from '../support';
import { generateAccounts } from '../support/mocks/generate-accounts';
import { generateCandles } from '../support/mocks/generate-candles';
import { generateChart } from '../support/mocks/generate-chart';
import { generateDealTicketQuery } from '../support/mocks/generate-deal-ticket-query';
import { generateMarket } from '../support/mocks/generate-market';
import { generateMarkets } from '../support/mocks/generate-markets';
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
describe('markets table', () => {
  beforeEach(() => {
    cy.mockGQL('Markets', (req) => {
      if (hasOperationName(req, 'Markets')) {
        req.reply({
          body: { data: generateMarkets() },
        });
      }
    });
    cy.visit('/markets');
  });

  it('can select an active market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    mockMarket(MarketState.Active);

    // click on active market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');
    cy.get('[role="gridcell"][col-id=data]').contains('Active').click();

    cy.wait('@Market');
    cy.contains('ACTIVE MARKET');
    cy.url().should('include', '/markets/market-0');
  });

  it('can select a suspended market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    mockMarket(MarketState.Suspended);

    // click on active market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');
    cy.get('[role="gridcell"][col-id=data]').contains('Suspended').click();

    cy.wait('@Market');
    cy.contains('SUSPENDED MARKET');
    cy.url().should('include', '/markets/market-1');
  });
});
