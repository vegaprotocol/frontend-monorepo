import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I go to the homepage', () => {
  cy.visit('/');
});
