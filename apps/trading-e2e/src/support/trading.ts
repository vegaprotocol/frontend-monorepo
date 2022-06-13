import type { MarketState } from '@vegaprotocol/types';
import { hasOperationName } from '.';
import { generateAccounts } from './mocks/generate-accounts';
import { generateCandles } from './mocks/generate-candles';
import { generateChart } from './mocks/generate-chart';
import { generateDealTicketQuery } from './mocks/generate-deal-ticket-query';
import { generateMarket } from './mocks/generate-market';
import { generateOrders } from './mocks/generate-orders';
import { generatePositions } from './mocks/generate-positions';
import { generateTrades } from './mocks/generate-trades';

export const mockTradingPage = (state: MarketState) => {
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
