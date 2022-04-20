import { Given } from 'cypress-cucumber-preprocessor/steps';

Given('I am on the homepage', () => {
  cy.visit('/');
});
