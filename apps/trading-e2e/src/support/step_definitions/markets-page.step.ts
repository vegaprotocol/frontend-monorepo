import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
import { generateMarkets } from '../mocks/generate-markets';
import MarketsPage from '../pages/markets-page';
import OrderBookList from '../trading-windows/orderbook-list';

const marketsPage = new MarketsPage();
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
