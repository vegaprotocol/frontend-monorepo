import { Given } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
import { MarketState } from '@vegaprotocol/types';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { generateTrades } from '../../../../../libs/trades/src/__tests__';
import {
  generateChart,
  generateCandles,
} from '../../../../../libs/chart/src/__tests__';
import { generateDealTicketQuery } from '../../../../../libs/deal-ticket/src/__tests__';
import { generateMarket } from '../../../../trading/pages/markets/__tests__';
/* eslint-enable @nrwl/nx/enforce-module-boundaries */

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

Given('I am on the trading page for an active market', () => {
  mockMarket(MarketState.Active);

  cy.visit('/markets/market-id');
  cy.wait('@Market', { timeout: 3000 });
  cy.contains('Market: ACTIVE MARKET');
});

Given('I am on the trading page for a suspended market', () => {
  mockMarket(MarketState.Suspended);

  cy.visit('/markets/market-id');
  cy.wait('@Market', { timeout: 3000 });
  cy.contains('Market: SUSPENDED MARKET');
});
