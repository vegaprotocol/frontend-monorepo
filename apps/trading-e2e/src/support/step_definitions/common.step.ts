import { Given } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
import { generateMarketList } from '../mocks/generate-market-list';
import BasePage from '../pages/base-page';
import MarketPage from '../pages/markets-page';

const basePage = new BasePage();
const marketPage = new MarketPage();

Given('I am on the homepage', () => {
  cy.mockGQL('MarketsList', (req) => {
    if (hasOperationName(req, 'MarketsList')) {
      req.reply({
        body: { data: generateMarketList() },
      });
    }
  });
  cy.visit('/');
  basePage.closeDialog();
  marketPage.validateMarketsAreDisplayed();
});

Given('I can connect to Ethereum', () => {
  cy.mockWeb3Provider();
});
