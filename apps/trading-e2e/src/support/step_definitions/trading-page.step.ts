import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
import { MarketState } from '@vegaprotocol/types';
import { generateChart } from '../mocks/generate-chart';
import { generateCandles } from '../mocks/generate-candles';
import { generateTrades } from '../mocks/generate-trades';
import { generateDealTicketQuery } from '../mocks/generate-deal-ticket-query';
import { generateMarket } from '../mocks/generate-market';
import { generateOrders } from '../mocks/generate-orders';
import { generatePositions } from '../mocks/generate-positions';
import { generateOrderBook } from '../mocks/generate-order-book';
import { generateAccounts } from '../mocks/generate-accounts';
import PositionsList from '../trading-windows/positions-list';
import AccountsList from '../trading-windows/accounts-list';
import TradesList from '../trading-windows/trades-list';
import TradingPage from '../pages/trading-page';
import OrdersList from '../trading-windows/orders-list';
import OrderBookList from '../trading-windows/orderbook-list';

const tradesList = new TradesList();
const tradingPage = new TradingPage();
const positionsList = new PositionsList();
const accountList = new AccountsList();
const ordersList = new OrdersList();
const orderBookList = new OrderBookList();

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

    if (hasOperationName(req, 'MarketDepth')) {
      req.reply({
        body: { data: generateOrderBook() },
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

When('I click on orders tab', () => {
  tradingPage.clickOnOrdersTab();
});

Then('placed orders are displayed', () => {
  ordersList.verifyOrdersDisplayed();
});

When('I click on accounts tab', () => {
  tradingPage.clickOnAccountsTab();
});

Then('accounts are displayed', () => {
  accountList.verifyAccountsDisplayed();
});

Then('I can see account for tEURO', () => {
  accountList.verifySingleAccountDisplayed(
    'General-tEURO-null',
    'tEURO',
    'General',
    '—',
    '1,000.00000'
  );
});

When('I click on positions tab', () => {
  tradingPage.clickOnPositionsTab();
});

Then('positions are displayed', () => {
  positionsList.verifyPositionsDisplayed();
});

When('I click on order book tab', () => {
  tradingPage.clickOrderBookTab();
});

Then('orderbook can be reduced and expanded', () => {
  orderBookList.verifyMockedOrderBookDisplayed(33);
  orderBookList.clickZoomOut();
  orderBookList.verifyMockedOrderBookDisplayed(6);
  orderBookList.verifyMockedOrderBookDisplayed(33);
  orderBookList.clickZoomIn();
  orderBookList.verifyCumulativeVolume(false, 123, '65%');
});
