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

Then('I am prompted to select a market', () => {
  cy.contains('Select a market to get started').should('be.visible');
});

And('a list of markets is shown', () => {
  marketsPage.getOpenMarkets().then(openMarkets => { 
    const arrayOfOpenMarkets = openMarkets.body.data.markets
    arrayOfOpenMarkets.forEach(market => {
      cy.contains(market.tradableInstrument.instrument.code).should('be.visible')
    })
  })
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