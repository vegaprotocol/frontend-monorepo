import { Given } from 'cypress-cucumber-preprocessor/steps';

// Utility to match GraphQL mutation based on the operation name
export const hasOperationName = (req, operationName) => {
  const { body } = req;
  return (
    // eslint-disable-next-line no-prototype-builtins
    body.hasOwnProperty('operationName') && body.operationName === operationName
  );
};

beforeEach(() => {
  cy.intercept('POST', 'https://lb.testnet.vega.xyz/query', (req) => {
    if (hasOperationName(req, 'Market')) {
      req.reply({
        fixture: 'markets/active/market.json',
      });
    }

    if (hasOperationName(req, 'DealTicketQuery')) {
      req.reply({
        fixture: 'markets/active/deal-ticket-query.json',
      });
    }

    if (hasOperationName(req, 'Trades')) {
      req.reply({
        fixture: 'markets/active/trades.json',
      });
    }

    if (hasOperationName(req, 'Chart')) {
      req.reply({
        fixture: 'markets/active/chart.json',
      });
    }

    if (hasOperationName(req, 'Candles')) {
      req.reply({
        fixture: 'markets/active/candles.json',
      });
    }
  }).as('Market');
});

Given('I am on the trading page for an active market', () => {
  cy.fixture('markets/active/market.json').then((f) => {
    cy.visit('/markets/test-market-active');
    cy.wait('@Market');
    cy.contains(`Market: ${f.data.market.name}`);
  });
});
