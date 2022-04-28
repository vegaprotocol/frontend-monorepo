import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { generateMarkets } from '../mocks/generate-markets';
import MarketsPage from '../pages/markets-page';
import TradingPage from '../pages/trading-page';
import PositionsList from '../trading-windows/positions-list';
import AccountsList from '../trading-windows/accounts-list';
import OrderBookList from '../trading-windows/orderbook-list';

const marketsPage = new MarketsPage();
const tradingPage = new TradingPage();
const positionsList = new PositionsList();
const accountList = new AccountsList();
const orderBookList = new OrderBookList();

const mockMarkets = () => {
  cy.mockGQL('Markets', (req) => {
    if (hasOperationName(req, 'Markets')) {
      req.reply({
        body: { data: generateMarkets() },
      });
    }
  });
};

beforeEach(() => {
  mockMarkets();
});

Then('I navigate to markets page', () => {
  marketsPage.navigateToMarkets();
});

Given('I am on the markets page', () => {
  cy.visit('/markets');
  cy.wait('@Markets');
});

Then('I can view markets', () => {
  cy.wait('@Markets');
  marketsPage.validateMarketsAreDisplayed();
});

And('the market table is displayed', () => {
  marketsPage.validateMarketTableDisplayed();
});

When('I click on {string} market', (Expectedmarket) => {
  marketsPage.clickOnMarket(Expectedmarket);
});

When('I click on positions tab', () => {
  tradingPage.clickOnPositionsTab();
});

Then('positions are displayed', () => {
  positionsList.verifyPositionsDisplayed();
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

When('I click on order book tab', () => {
  tradingPage.clickOrderBookTab();
});

Then('orderbook can be reduced and expanded', () => {
  orderBookList.verifyMockedOrderBookDisplayed(33);
  orderBookList.clickZoomOut();
  orderBookList.verifyMockedOrderBookDisplayed(6);
  orderBookList.clickZoomIn();
  orderBookList.verifyMockedOrderBookDisplayed(33);
  orderBookList.verifyCumulativeVolume(false, 123, '65%');
});
