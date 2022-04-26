import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';
import BasePage from '../pages/base-page';
const basePage = new BasePage();

Given('I am on mobile and open the toggle menu', () => {
  cy.viewport('iphone-x');
  cy.visit('/');
  basePage.clickOnToggle();
});

Given('I am on the homepage', () => {
  cy.visit('/');
});

When('I search for {string}', (searchText) => {
  basePage.search(searchText);
  basePage.clickSearch();
});

Then('I am redirected to page containing id {string}', (expectedUrl) => {
  basePage.validateUrl(expectedUrl);
});

Then('search error message {string} is displayed', (expectedErrorMsg) => {
  basePage.validateSearchErrorDisplayed(expectedErrorMsg);
});
