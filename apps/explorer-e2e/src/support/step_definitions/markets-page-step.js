import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

import MarketsPage from '../pages/markets-page';
const marketsPage = new MarketsPage();

When('I navigate to the markets page', () => {
  marketsPage.navigateToMarkets();
});

Then('markets page is correctly displayed', () => {
  marketsPage.validateMarketDataDisplayed();
});
