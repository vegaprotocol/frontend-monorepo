<<<<<<< HEAD
import { When, Then } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
const marketsPage = new MarketsPage();

When('I click on market for {string}', (marketText) => {
  marketsPage.clickOnMarket(marketText);
});

When('I click on active market', () => {
  if (Cypress.env('bypassPlacingOrders' != true)) {
    marketsPage.clickOnMarket('Active');
  } else {
    marketsPage.clickOnTopMarketRow();
  }
});

When('I click on suspended market', () => {
  marketsPage.clickOnMarket('Suspended');
});

Then('the market table is displayed', () => {
  marketsPage.validateMarketTableDisplayed();
=======
import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
import TradingPage from '../pages/trading-page';
import { hasOperationName } from './trading-page.step';

const marketsPage = new MarketsPage();
const tradingPage = new TradingPage();

const mockMarkets = () => {
  cy.intercept('POST', 'https://lb.testnet.vega.xyz/query', (req) => {
    if (hasOperationName(req, 'Markets')) {
      req.reply({
        fixture: 'markets/markets.json',
      });
    }
  }).as('Markets');
};

beforeEach(() => {
  mockMarkets();
});

Then('I can navigate to the markets page', () => {
  marketsPage.navigateToMarkets();
});

Given('I am on the markets page', () => {
  cy.visit('/markets');
  cy.wait('@Markets');
});

Then('I can view markets', () => {
  marketsPage.validateMarketsAreDisplayed();
});

When('I click on an active market', () => {
  marketsPage.clickOnMarket('Active');
});

When('I click on a suspended market', () => {
  marketsPage.clickOnMarket('Suspended');
>>>>>>> bb936507 (add portfolio page feature, add market page scenarios)
});
