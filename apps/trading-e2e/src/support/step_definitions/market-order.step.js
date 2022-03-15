import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
const marketsPage = new MarketsPage();

When('I click on market for {string}', (marketText) => {
  marketsPage.clickOnMarket(marketText);
  marketsPage.clickOnTicketTab();
});
