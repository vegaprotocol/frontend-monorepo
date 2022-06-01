import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import { forEach } from 'lodash';
import { hasOperationName } from '..';
import { generateMarkets } from '../mocks/generate-markets';
import MarketsPage from '../pages/markets-page';

const marketsPage = new MarketsPage();

const mockMarkets = () => {
  cy.log('Mocking markets query');
  cy.mockGQL('Markets', (req) => {
    if (hasOperationName(req, 'Markets')) {
      req.reply({
        body: { data: generateMarkets() },
      });
    }
  });
};

Then('I navigate to markets page', () => {
  mockMarkets();
  marketsPage.navigateToMarkets();
  cy.wait('@Markets');
});

Then('I can view markets', () => {
  marketsPage.validateMarketsAreDisplayed();
});

Given('I am on the markets page', () => {
  mockMarkets();
  cy.visit('/markets');
  cy.wait('@Markets');
});

Then('I can view markets', () => {
  marketsPage.validateMarketsAreDisplayed();
});

And('the market table is displayed', () => {
  marketsPage.validateMarketTableDisplayed();
});

When('I click on {string} market', (Expectedmarket) => {
  marketsPage.clickOnMarket(Expectedmarket);
});
