import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
import MarketsPage from '../pages/markets-page';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { generateMarkets } from '../../../../../libs/market-list/src/__tests__/generate-markets';

const marketsPage = new MarketsPage();

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

When('I click on an active market', () => {
  marketsPage.clickOnMarket('Active');
});

When('I click on a suspended market', () => {
  marketsPage.clickOnMarket('Suspended');
});
