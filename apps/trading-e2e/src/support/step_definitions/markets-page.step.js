import { When, Then } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
const marketsPage = new MarketsPage();

When('I click on market for {string}', (marketText) => {
  marketsPage.clickOnMarket(marketText);
});

When('I click on active market', () => {
  if (Cypress.env('bypassPlacingOrders' != true)) {
    marketsPage.clickOnMarket('Active');
  } else marketsPage.clickOnTopMarketRow();
});

When('I click on suspended market', () => {
  marketsPage.clickOnMarket('Suspended');
});

Then('the market table is displayed', () => {
  marketsPage.validateMarketTableDisplayed();
});
