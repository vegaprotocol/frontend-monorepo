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
import MarketPage from '../pages/markets-page';

const tradesList = new TradesList();
const tradingPage = new TradingPage();
const positionsList = new PositionsList();
const accountList = new AccountsList();
const ordersList = new OrdersList();
const orderBookList = new OrderBookList();
const marketPage = new MarketPage();

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

When('I click on {string} mocked market', (marketType) => {
  switch (marketType) {
    case 'Active':
      mockMarket(MarketState.Active);
      break;
    case 'Suspended':
      mockMarket(MarketState.Suspended);
      break;
  }
  marketPage.clickOnMarket(marketType);
});

Then('trading page for {string} market is displayed', (marketType) => {
  switch (marketType) {
    case 'active':
      cy.wait('@Market');
      cy.contains('Market: ACTIVE MARKET');
      break;
    case 'suspended':
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

Then('orderbook is displayed with expected orders', () => {
  orderBookList.verifyOrderBookRow('826342', '0', '8.26342', '264', '1488');
  orderBookList.verifyOrderBookRow('826336', '1475', '8.26336', '0', '1675');
  orderBookList.verifyDisplayedVolume(
    '826342',
    false,
    '18%',
    orderBookList.testingVolume.AskVolume
  );
  orderBookList.verifyDisplayedVolume(
    '826331',
    true,
    '100%',
    orderBookList.testingVolume.CumulativeVolume
  );
// mid level price
  orderBookList.verifyOrderBookRow('826337', '0', '8.26337', '0', '200');
  orderBookList.verifyDisplayedVolume(
    '826337',
    true,
    '6%',
    orderBookList.testingVolume.CumulativeVolume
  );
  orderBookList.verifyTopMidPricePosition('123')
  orderBookList.verifyBottomMidPricePosition('144')

// autofilled order
  orderBookList.verifyOrderBookRow('826330', '0', '8.26330', '0', '3548');
  orderBookList.verifyDisplayedVolume(
    '826330',
    true,
    '0%',
    orderBookList.testingVolume.BidVolume
  );
  orderBookList.verifyDisplayedVolume(
    '826330',
    true,
    '100%',
    orderBookList.testingVolume.CumulativeVolume
  );

});

Then('orderbook can be reduced and expanded', () => {
  orderBookList.changePrecision('10');
  orderBookList.verifyOrderBookRow(
    '82634',
    '1868',
    '8.2634',
    '1488',
    '1488/1868'
  );
  orderBookList.verifyCumulativeAskBarPercentage('42%');
  orderBookList.verifyCumulativeBidBarPercentage('53%');
  orderBookList.changePrecision('100');
  orderBookList.verifyOrderBookRow('8263', '3568', '8.263', '1488', '');
  orderBookList.verifyDisplayedVolume(
    '8263',
    true,
    '100%',
    orderBookList.testingVolume.BidVolume
  );
  orderBookList.verifyDisplayedVolume(
    '8263',
    false,
    '42%',
    orderBookList.testingVolume.AskVolume
  );
  orderBookList.changePrecision('1');
  orderBookList.verifyOrderBookRow('826342', '0', '8.26342', '264', '1488');
});
