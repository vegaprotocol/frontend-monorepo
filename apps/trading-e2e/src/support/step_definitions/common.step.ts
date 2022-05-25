import { Given } from 'cypress-cucumber-preprocessor/steps';
import BasePage from '../pages/base-page';

const basePage = new BasePage();

Given('I am on the homepage', () => {
  cy.visit('/');
  basePage.closeDialog();
});
