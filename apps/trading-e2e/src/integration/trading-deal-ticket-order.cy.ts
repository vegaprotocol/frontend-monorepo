import {
  orderPriceField,
  orderSizeField,
  orderTIFDropDown,
  placeOrderBtn,
  toggleLimit,
  toggleMarket,
} from '../support/deal-ticket';

describe('deal ticker order validation', { tags: '@smoke' }, () => {
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');

    cy.get('[data-testid="deal-ticket-form"]').then(($form) => {
      if (!$form.length) {
        cy.getByTestId('Order').click();
      }
    });
  });

  beforeEach(() => {
    cy.mockTradingPage();
  });

  describe('limit order', () => {
    before(() => {
      cy.getByTestId(toggleLimit).click();
    });

    it('must see the price unit', function () {
      // 7002-SORD-018
      cy.getByTestId(orderPriceField).next().should('have.text', 'DAI');
    });

    it('must see warning when placing an order with expiry date in past', () => {
      const expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const expiresAtInputValue = expiresAt.toISOString().substring(0, 16);
      cy.getByTestId(toggleLimit).click();
      cy.getByTestId(orderPriceField).clear().type('0.1');
      cy.getByTestId(orderSizeField).clear().type('1');
      cy.getByTestId(orderTIFDropDown).select('TIME_IN_FORCE_GTT');

      cy.log('choosing yesterday');
      cy.getByTestId('date-picker-field').type(expiresAtInputValue);

      cy.getByTestId(placeOrderBtn).click();

      cy.getByTestId('deal-ticket-error-message-expiry').should(
        'have.text',
        'The expiry date that you have entered appears to be in the past'
      );
    });

    it('must see warning if price has too many digits after decimal place', function () {
      // 7002-SORD-059
      cy.getByTestId(toggleLimit).click();
      cy.getByTestId(orderTIFDropDown).select('TIME_IN_FORCE_GTC');
      cy.getByTestId(orderSizeField).clear().type('1');
      cy.getByTestId(orderPriceField).clear().type('1.123456');
      cy.getByTestId(placeOrderBtn).click();
      cy.getByTestId('deal-ticket-error-message-price').should(
        'have.text',
        'Price accepts up to 5 decimal places'
      );
    });
  });

  describe('market order', () => {
    before(() => {
      cy.getByTestId(toggleMarket).click();
      cy.getByTestId(placeOrderBtn).click();
    });

    it('must not see the price unit', function () {
      // 7002-SORD-019
      cy.getByTestId(orderPriceField).should('not.exist');
    });

    it('must warn if order size input has too many digits after the decimal place', function () {
      // 7002-SORD-016
      cy.getByTestId(orderSizeField).clear().type('1.234');
      // 7002-SORD-060
      cy.getByTestId(placeOrderBtn).should('be.enabled');
      cy.getByTestId('deal-ticket-error-message-size').should(
        'have.text',
        'Size must be whole numbers for this market'
      );
    });

    it('must warn if order size is set to 0', function () {
      cy.getByTestId(orderSizeField).clear().type('0');
      cy.getByTestId(placeOrderBtn).should('be.enabled');
      cy.getByTestId('deal-ticket-error-message-size').should(
        'have.text',
        'Size cannot be lower than 1'
      );
    });

    it('must have total margin available', () => {
      // 7001-COLL-011
      cy.getByTestId('deal-ticket-fee-total-margin-available').within(() => {
        cy.get('[data-state="closed"]').should(
          'have.text',
          'Total margin available100.01 tDAI'
        );
      });
    });

    it('must have current margin allocation', () => {
      cy.getByTestId('deal-ticket-fee-current-margin-allocation').within(() => {
        cy.get('[data-state="closed"]:first').should(
          'have.text',
          'Current margin allocation'
        );
      });
    });

    it('should open usage breakdown dialog when clicked on current margin allocation', () => {
      cy.getByTestId('deal-ticket-fee-current-margin-allocation').within(() => {
        cy.get('button').click();
      });
      cy.getByTestId('usage-breakdown').should('exist');
      cy.getByTestId('dialog-close').click();
    });
  });
});
