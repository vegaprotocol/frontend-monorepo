import { Given, When } from 'cypress-cucumber-preprocessor/steps';
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
  cy.getByTestId('market', { timeout: 60000 }).should('be.visible', {
    timeout: 20000,
  });
  cy.contains('Loading...', { timeout: 20000 }).should('not.exist');
});

When('I close the dialog form', () => {
  basePage.closeDialog();
});

Given('I can connect to Ethereum', () => {
  cy.mockWeb3Provider();
});
