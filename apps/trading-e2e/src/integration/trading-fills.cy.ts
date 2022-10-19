import { aliasQuery } from '@vegaprotocol/cypress';
import { generateFills } from '../support/mocks/generate-fills';
import { connectVegaWallet } from '../support/vega-wallet';

describe('fills', { tags: '@regression' }, () => {
  beforeEach(() => {
    cy.mockTradingPage();
    cy.mockGQL((req) => {
      aliasQuery(req, 'Fills', generateFills());
    });
    cy.mockGQLSubscription();
  });

  it('renders fills on portfolio page', () => {
    cy.visit('/portfolio');
    cy.get('main[data-testid="portfolio"]').should('exist');
    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').contains('Connect your Vega wallet');
    connectVegaWallet();
    validateFillsDisplayed();
  });

  it('renders fills on trading tab', () => {
    cy.mockTradingPage();
    cy.visit('/markets/market-0');
    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').contains('Please connect Vega wallet');
    connectVegaWallet();
    validateFillsDisplayed();
  });

  function validateFillsDisplayed() {
    cy.getByTestId('tab-fills').should('be.visible');

    cy.getByTestId('tab-fills')
      .get(
        '[role="gridcell"][col-id="market.tradableInstrument.instrument.name"]'
      )
      .each(($marketSymbol) => {
        cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-fills')
      .get('[role="gridcell"][col-id="size"]')
      .each(($amount) => {
        cy.wrap($amount).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[role="gridcell"][col-id="price"]')
      .each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[role="gridcell"][col-id="price_1"]')
      .each(($total) => {
        cy.wrap($total).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[role="gridcell"][col-id="aggressor"]')
      .each(($role) => {
        cy.wrap($role)
          .invoke('text')
          .then((text) => {
            const roles = ['Maker', 'Taker'];
            expect(roles.indexOf(text.trim())).to.be.greaterThan(-1);
          });
      });
    cy.getByTestId('tab-positions')
      .get(
        '[role="gridcell"][col-id="market.tradableInstrument.instrument.product"]'
      )
      .each(($fees) => {
        cy.wrap($fees).invoke('text').should('not.be.empty');
      });
    const dateTimeRegex =
      /(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/gm;
    cy.get('[col-id="createdAt"]').each(($tradeDateTime, index) => {
      if (index != 0) {
        //ignore header
        cy.wrap($tradeDateTime).invoke('text').should('match', dateTimeRegex);
      }
    });
  }
});
