import { Given, Then } from 'cypress-cucumber-preprocessor/steps';
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
import TradesList from '../trading-windows/trades-list';
import TradingPage from '../pages/trading-page';

const tradesList = new TradesList();
const tradingPage = new TradingPage();
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
  cy.wait('@Market');
  cy.contains('Market: ACTIVE MARKET');
});

Given('I am on the trading page for a suspended market', () => {
  mockMarket(MarketState.Suspended);

  cy.visit('/markets/market-id');
  cy.wait('@Market');
  cy.contains('Market: SUSPENDED MARKET');
});

Then('trading page for {string} market is displayed', (marketType) => {
  switch (marketType) {
    case 'active':
      mockMarket(MarketState.Active);
      cy.wait('@Market');
      cy.contains('Market: ACTIVE MARKET');
      break;
    case 'suspended':
      mockMarket(MarketState.Suspended);
      cy.wait('@Market');
      cy.contains('Market: SUSPENDED MARKET');
      break;
  }
  tradingPage.clickOnTradesTab();
  tradesList.verifyTradesListDisplayed();
});
