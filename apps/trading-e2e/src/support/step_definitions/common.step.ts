import { Given } from 'cypress-cucumber-preprocessor/steps';
import BasePage from '../pages/base-page';

const basePage = new BasePage();

Given('I am on the homepage', () => {
  cy.visit('/');
  cy.contains('Loading...', { timeout: 60000 }).should('not.exist');
});

When('I close the dialog form', () => {
  basePage.closeDialog();
});
