import * as Schema from '@vegaprotocol/types';
import type { OrderAmendment, OrderCancellation } from '@vegaprotocol/wallet';
import {
  updateOrder,
  getSubscriptionMocks,
} from '../support/order-update-subscription';
import {
  testOrderCancellation,
  testOrderAmendment,
} from '../support/order-validation';
import { vega as vegaProtos } from '@vegaprotocol/protos';

describe('amend and cancel order', { tags: '@smoke' }, () => {
  beforeEach(() => {
    const subscriptionMocks = getSubscriptionMocks();
    cy.spy(subscriptionMocks, 'OrdersUpdate');
    cy.mockTradingPage();
    cy.mockSubscription(subscriptionMocks);
    cy.setVegaWallet();
    cy.visit('/#/markets/market-0');
    cy.getByTestId('All').click();
    cy.getByTestId('tab-orders').within(() => {
      cy.get('[col-id="status"][role="columnheader"]')
        .focus()
        .find('.ag-header-cell-menu-button')
        .click();
      cy.get('.ag-filter-apply-panel-button').click();
    });
    cy.mockVegaWalletTransaction();
  });

  const orderId = '1234567890';
  it('must be able to amend the price of an order', () => {
    // 7003-MORD-007
    // 7003-MORD-012
    // 7003-MORD-014
    // 7003-MORD-015
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: null,
      liquidityProvisionId: null,
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[data-testid="edit"]')
      .should('have.text', 'Edit')
      .then(($btn) => {
        cy.wrap($btn).click();
        cy.getByTestId('dialog-title').should('have.text', 'Edit order');
        cy.get('#limitPrice').focus().clear().type('100');
        cy.getByTestId('edit-order').find('[type="submit"]').click();
        const order: OrderAmendment = {
          orderId: orderId,
          marketId: 'market-0',
          price: '10000000',
          timeInForce: vegaProtos.Order.TimeInForce.TIME_IN_FORCE_GTC,
          sizeDelta: BigInt(0),
        };
        testOrderAmendment(order);
      });
  });
  it('must be able to cancel an individual order', () => {
    // 7003-MORD-007
    // 7003-MORD-009
    // 7003-MORD-010
    // 7003-MORD-011
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: null,
      liquidityProvisionId: null,
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="cancel"]`)
      .should('have.text', 'Cancel')
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
        const order: OrderCancellation = {
          orderId: orderId,
          marketId: 'market-0',
        };
        testOrderCancellation(order);
      });
  });
  it('must be able to cancel all orders on all markets', () => {
    // 7003-MORD-009
    // 7003-MORD-010
    // 7003-MORD-011
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: null,
      liquidityProvisionId: null,
    });
    cy.get(`[data-testid="cancelAll"]`)
      .should('have.text', 'Cancel all')
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
        const order: OrderCancellation = {};
        testOrderCancellation(order);
      });
  });
  it('must be warned (pre-submit) if the input price has too many digits after the decimal place for the market', () => {
    // 7003-MORD-013
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: null,
      liquidityProvisionId: null,
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[data-testid="edit"]')
      .should('have.text', 'Edit')
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
        cy.getByTestId('dialog-title').should('have.text', 'Edit order');
        cy.get('#limitPrice').focus().clear().type('0.111111');
        cy.getByTestId('edit-order').find('[type="submit"]').click();
        cy.getByTestId('input-error-text').should(
          'have.text',
          'Price accepts up to 5 decimal places'
        );
      });
  });
});
