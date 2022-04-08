import { Given } from 'cypress-cucumber-preprocessor/steps';
import { hasOperationName } from '..';

const mockMarket = (state) => {
  cy.intercept('POST', 'https://lb.testnet.vega.xyz/query', (req) => {
    if (hasOperationName(req, 'Market')) {
      req.reply({
        fixture: `markets/${state}/market.json`,
      });
    }

    if (hasOperationName(req, 'DealTicketQuery')) {
      req.reply({
        fixture: `markets/${state}/deal-ticket-query.json`,
      });
    }

    if (hasOperationName(req, 'Trades')) {
      req.reply({
        fixture: `markets/${state}/trades.json`,
      });
    }

    if (hasOperationName(req, 'Chart')) {
      req.reply({
        fixture: `markets/${state}/chart.json`,
      });
    }

    if (hasOperationName(req, 'Candles')) {
      req.reply({
        fixture: `markets/${state}/candles.json`,
      });
    }
  }).as('Market');
};

Given('I am on the trading page for an active market', () => {
  mockMarket('active');

  cy.fixture('markets/active/market.json').then((f) => {
    cy.visit('/markets/test-market-active');
    cy.wait('@Market');
    cy.contains(`Market: ${f.data.market.name}`);
  });
});

Given('I am on the trading page for a suspended market', () => {
  mockMarket('suspended');

  cy.fixture('markets/suspended/market.json').then((f) => {
    cy.visit('/markets/test-market-suspended');
    cy.wait('@Market');
    cy.contains(`Market: ${f.data.market.name}`);
  });
});
