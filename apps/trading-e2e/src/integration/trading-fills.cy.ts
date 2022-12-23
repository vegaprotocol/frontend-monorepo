import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { fillsQuery } from '@vegaprotocol/mock';

describe('fills', { tags: '@regression' }, () => {
  beforeEach(() => {
    // Ensure page loads with correct key
    cy.window().then((window) => {
      cy.wrap(
        window.localStorage.setItem(
          'vega_wallet_key',
          Cypress.env('VEGA_PUBLIC_KEY')
        )
      );
    });
    cy.mockTradingPage();
    cy.mockGQL((req) => {
      aliasGQLQuery(
        req,
        'Fills',
        fillsQuery({}, Cypress.env('VEGA_PUBLIC_KEY'))
      );
    });
    cy.mockSubscription();
  });

  it('renders fills on portfolio page', () => {
    cy.visit('/#/portfolio');
    cy.get('main[data-testid="/portfolio"]').should('exist');
    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').contains('Connect your Vega wallet');
    cy.connectVegaWallet();
    validateFillsDisplayed();
  });

  it('renders fills on trading tab', () => {
    cy.mockTradingPage();
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').should(
      'contain.text',
      'Connect your Vega wallet'
    );
    cy.connectVegaWallet();
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
    cy.getByTestId('tab-fills')
      .get('[role="gridcell"][col-id="price"]')
      .each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-fills')
      .get('[role="gridcell"][col-id="price_1"]')
      .each(($total) => {
        cy.wrap($total).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-fills')
      .get('[role="gridcell"][col-id="aggressor"]')
      .each(($role) => {
        cy.wrap($role)
          .invoke('text')
          .then((text) => {
            const roles = ['Maker', 'Taker'];
            expect(roles.indexOf(text.trim())).to.be.greaterThan(-1);
          });
      });
    cy.getByTestId('tab-fills')
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
