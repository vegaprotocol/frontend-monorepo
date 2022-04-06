import { Given, When } from 'cypress-cucumber-preprocessor/steps';
import MarketsPage from '../pages/markets-page';
import DealTicketPage from '../pages/deal-ticket-page';

const marketsPage = new MarketsPage();
const dealTicketPage = new DealTicketPage();

// Utility to match GraphQL mutation based on the operation name
export const hasOperationName = (req, operationName) => {
  const { body } = req;
  return (
    // eslint-disable-next-line no-prototype-builtins
    body.hasOwnProperty('operationName') && body.operationName === operationName
  );
};

Given('I am on the homepage', () => {
  cy.visit('/');
});

Given('I navigate to markets page', () => {
  cy.intercept('POST', 'https://lb.testnet.vega.xyz/query', (req) => {
    if (hasOperationName(req, 'Markets')) {
      req.reply({
        fixture: 'markets.json',
      });
    }
  });
  marketsPage.navigateToMarkets();
});

Given('I navigate to portfolio page', () => {
  marketsPage.navigateToPortfolio();
});

When('I connect to Vega Wallet', () => {
  marketsPage.navigateToConnectVegaWallet();
  marketsPage.fillInWalletForm(
    'UI_Trading_Test',
    Cypress.env('tradingWalletPassphrase')
  );
  marketsPage.clickConnectVegaWallet();
  dealTicketPage.reloadPageIfPublicKeyErrorDisplayed();
});
