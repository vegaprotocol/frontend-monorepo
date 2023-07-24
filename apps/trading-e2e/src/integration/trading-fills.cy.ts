import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { fillsQuery } from '@vegaprotocol/mock';

const tabFills = 'tab-fills';

describe('fills', { tags: '@regression' }, () => {
  // 7005-FILL-001
  // 7005-FILL-002
  // 7005-FILL-003
  // 7005-FILL-004
  // 7005-FILL-005
  // 7005-FILL-006
  // 7005-FILL-007
  // 7005-FILL-008

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
    cy.setVegaWallet();
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
    cy.get('[data-testid="pathname-/portfolio"]').should('exist');
    cy.getByTestId('Fills').click();
    validateFillsDisplayed();
  });

  it('renders fills on trading tab', () => {
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Fills').click();
    validateFillsDisplayed();
  });

  function validateFillsDisplayed() {
    cy.getByTestId(tabFills).should('be.visible');
    cy.getByTestId(tabFills).contains('Market');
    cy.getByTestId(tabFills)
      .get(
        '[role="gridcell"][col-id="market.tradableInstrument.instrument.name"]'
      )
      .each(($marketSymbol) => {
        cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
      });
    cy.getByTestId(tabFills).contains('Size');
    cy.get(`[col-id='size']`).eq(1).should('contain.text', '+');
    cy.get(`[col-id='size']`).eq(2).should('contain.text', '-');
    cy.getByTestId(tabFills)
      .get('[role="gridcell"][col-id="size"]')
      .each(($amount) => {
        cy.wrap($amount).invoke('text').should('not.be.empty');
      });
    cy.getByTestId(tabFills).contains('Price');
    cy.getByTestId(tabFills)
      .get('[role="gridcell"][col-id="price"]')
      .each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });
    cy.getByTestId(tabFills).contains('Notional');
    cy.getByTestId(tabFills)
      .get('[role="gridcell"][col-id="price_1"]')
      .each(($total) => {
        cy.wrap($total).invoke('text').should('not.be.empty');
      });
    cy.getByTestId(tabFills).contains('Role');
    cy.getByTestId(tabFills)
      .get('[role="gridcell"][col-id="aggressor"]')
      .each(($role) => {
        cy.wrap($role)
          .invoke('text')
          .then((text) => {
            const roles = ['Maker', 'Taker', '-'];
            expect(roles.indexOf(text.trim())).to.be.greaterThan(-1);
          });
      });
    cy.getByTestId(tabFills).contains('Fee');
    cy.getByTestId(tabFills)
      .get(
        '[role="gridcell"][col-id="market.tradableInstrument.instrument.product"]'
      )
      .each(($fees) => {
        cy.wrap($fees).invoke('text').should('not.be.empty');
      });
    cy.getByTestId(tabFills).contains('Date');
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
