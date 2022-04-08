import { Given } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/trading-page';

const marketsPage = new MarketsPage();

Given('I am on the homepage', () => {
  cy.visit('/');
});

Given('I navigate to markets page', () => {
  marketsPage.navigateToMarkets();
});

Given('I navigate to portfolio page', () => {
  marketsPage.navigateToPortfolio();
});
