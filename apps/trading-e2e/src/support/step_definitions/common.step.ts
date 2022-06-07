import { Given } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';
import { generateMarketList } from '../mocks/generate-market-list';
import BasePage from '../pages/base-page';

const basePage = new BasePage();

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
});
