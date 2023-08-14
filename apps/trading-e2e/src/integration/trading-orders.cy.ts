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

const orderSymbol = 'market.tradableInstrument.instrument.code';
const orderSize = 'size';
const orderType = 'type';
const orderStatus = 'status';
const orderRemaining = 'remaining';
const orderPrice = 'price';
const orderTimeInForce = 'timeInForce';
const orderUpdatedAt = 'updatedAt';
const cancelOrderBtn = 'cancel';
const cancelAllOrdersBtn = 'cancelAll';
const editOrderBtn = 'edit';

describe('orders list', { tags: '@smoke', testIsolation: true }, () => {
  beforeEach(() => {
    const subscriptionMocks = getSubscriptionMocks();
    cy.spy(subscriptionMocks, 'OrdersUpdate');
    cy.mockTradingPage();
    cy.mockSubscription(subscriptionMocks);
    cy.setVegaWallet();
    cy.visit('/#/markets/market-0');
    cy.getByTestId('All').click();
    cy.wait('@Markets');
  });

  it('renders orders', () => {
    cy.getByTestId('tab-orders').should('be.visible');
    cy.getByTestId(cancelAllOrdersBtn).should('be.visible');
    cy.getByTestId(cancelOrderBtn).should('have.length.at.least', 1);
    cy.getByTestId(editOrderBtn).should('have.length.at.least', 1);
    cy.getByTestId('tab-orders').within(() => {
      cy.get(`[role='rowgroup']`)
        .first()
        .within(() => {
          cy.get(`[col-id='${orderSymbol}']`).each(($symbol) => {
            cy.wrap($symbol).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderRemaining}']`).each(($remaining) => {
            cy.wrap($remaining).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderSize}']`).each(($size) => {
            cy.wrap($size).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderType}']`).each(($type) => {
            cy.wrap($type).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderStatus}']`).each(($status) => {
            cy.wrap($status).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderPrice}']`).each(($price) => {
            cy.wrap($price).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderTimeInForce}']`).each(($timeInForce) => {
            cy.wrap($timeInForce).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderUpdatedAt}']`).each(($dateTime) => {
            cy.wrap($dateTime).invoke('text').should('not.be.empty');
          });
        });
    });
  });

  it('partially filled orders should not show close/edit buttons', () => {
    const partiallyFilledId =
      '94aead3ca92dc932efcb503631b03a410e2a5d4606cae6083e2406dc38e52f78';

    cy.getByTestId('tab-orders').should('be.visible');
    cy.get('.ag-header-container').within(() => {
      cy.get('[col-id="status"]').realHover();
      cy.get('[col-id="status"] .ag-icon-menu').click();
    });
    cy.contains('Partially Filled').click();
    cy.getByTestId('All').click();

    cy.get(`[row-id="${partiallyFilledId}"]`)
      .eq(0)
      .within(() => {
        cy.get(`[col-id='${orderStatus}']`).should(
          'have.text',
          'Partially Filled'
        );
        cy.get(`[col-id='${orderRemaining}']`).should('have.text', '7');
        cy.get(`[col-id='${orderSize}']`).should('have.text', '-10');
        cy.getByTestId(cancelOrderBtn).should('not.exist');
        cy.getByTestId(editOrderBtn).should('not.exist');
      });
  });

  it('orders are sorted by most recent order', () => {
    // 7003-MORD-002
    const expectedOrderList = [
      'BTCUSD.MF21',
      'SOLUSD',
      'AAPL.MF21',
      'BTCUSD.MF21',
      'BTCUSD.MF21',
    ];
    cy.get('.ag-header-container').within(() => {
      cy.get('[col-id="status"]').realHover();
      cy.get('[col-id="status"] .ag-icon-menu').click();
    });
    cy.contains('Reset').click();
    cy.getByTestId('All').click();

    cy.getByTestId('tab-orders')
      .get(
        `.ag-center-cols-container [col-id='${orderSymbol}'] [data-testid="market-code"]`
      )
      .should('have.length.at.least', expectedOrderList.length)
      .then(($symbols) => {
        const symbolNames: string[] = [];
        cy.wrap($symbols)
          .each(($symbol) => {
            cy.wrap($symbol)
              .invoke('text')
              .then((text) => {
                symbolNames.push(text);
              });
          })
          .then(() => {
            expect(symbolNames).to.include.ordered.members(expectedOrderList);
          });
      });
  });
});

describe('subscribe orders', { tags: '@smoke' }, () => {
  let orderId = '0';
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
    orderId = (parseInt(orderId, 10) + 1).toString();
  });
  // 7002-SORD-053
  // 7002-SORD-040
  // 7003-MORD-001

  it('must see an active order', () => {
    // 7002-SORD-041
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
    });
    cy.getByTestId(`order-status-${orderId}`).should('have.text', 'Active');
  });

  it('must see an expired order', () => {
    // 7002-SORD-042
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_EXPIRED,
    });
    cy.getByTestId(`order-status-${orderId}`).should('have.text', 'Expired');
  });

  it('must see a cancelled order', () => {
    // 7002-SORD-043
    // NOT COVERED:  see the txn that cancelled it and a link to the block explorer, if cancelled by a user transaction.
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_CANCELLED,
    });
    cy.getByTestId(`order-status-${orderId}`).should('have.text', 'Cancelled');
  });

  it('must see a stopped order', () => {
    // 7002-SORD-044
    // NOT COVERED:  see an explanation of why stopped
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_STOPPED,
    });
    cy.getByTestId(`order-status-${orderId}`).should('have.text', 'Stopped');
  });

  it('must see a partially filled order', () => {
    // 7002-SORD-045
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_PARTIALLY_FILLED,
      size: '5',
      remaining: '1',
    });
    cy.getByTestId(`order-status-${orderId}`).should(
      'have.text',
      'Partially Filled'
    );
    cy.getByTestId(`order-status-${orderId}`)
      .parentsUntil(`.ag-row`)
      .siblings(`[col-id=${orderRemaining}]`)
      .should('have.text', '4');
  });

  it('must see a filled order', () => {
    // 7002-SORD-046
    // NOT COVERED:  Must be able to see/link to all trades that were created from this order
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_FILLED,
    });
    cy.getByTestId(`order-status-${orderId}`).should('have.text', 'Filled');
  });

  it('must see a rejected order', () => {
    // 7002-SORD-047
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_REJECTED,
      rejectionReason: Schema.OrderRejectionReason.ORDER_ERROR_INTERNAL_ERROR,
    });
    cy.getByTestId(`order-status-${orderId}`).should(
      'have.text',
      'Rejected: Internal error'
    );
  });

  it('must see a parked order', () => {
    // 7002-SORD-048
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_PARKED,
    });
    cy.getByTestId(`order-status-${orderId}`).should(
      'have.text',
      'Parked: Internal error'
    );
  });

  it('must see the size of the order and direction/side -', () => {
    // 7003-MORD-003
    // 7003-MORD-004
    updateOrder({
      id: orderId,
      size: '15',
      side: Schema.Side.SIDE_SELL,
      status: Schema.OrderStatus.STATUS_ACTIVE,
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[col-id="${orderSize}"]`)
      .should('have.text', '-15');
  });

  it('must see the size of the order and direction/side +', () => {
    // 7003-MORD-003
    // 7003-MORD-004
    updateOrder({
      id: orderId,
      size: '5',
      side: Schema.Side.SIDE_BUY,
      status: Schema.OrderStatus.STATUS_ACTIVE,
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[col-id="${orderSize}"]`)
      .should('have.text', '+5');
  });

  it('for limit typy must see the Limit price that was set on the order', () => {
    // 7003-MORD-005
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[col-id="price"]')
      .should('have.text', '200.00');
  });

  it('must see a pegged order - ask', () => {
    updateOrder({
      id: orderId,
      side: Schema.Side.SIDE_BUY,
      peggedOrder: {
        __typename: 'PeggedOrder',
        reference: Schema.PeggedReference.PEGGED_REFERENCE_BEST_ASK,
        offset: '250000',
      },
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[col-id="type"]')
      .should('have.text', 'Ask - 2.50 Peg limit');
  });

  it('must see a pegged order - bid', () => {
    updateOrder({
      id: orderId,
      side: Schema.Side.SIDE_SELL,
      peggedOrder: {
        __typename: 'PeggedOrder',
        reference: Schema.PeggedReference.PEGGED_REFERENCE_BEST_BID,
        offset: '100',
      },
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[col-id="type"]')
      .should('have.text', 'Bid + 0.001 Peg limit');
  });

  it('must see a pegged order - mid', () => {
    updateOrder({
      id: orderId,
      side: Schema.Side.SIDE_SELL,
      peggedOrder: {
        __typename: 'PeggedOrder',
        reference: Schema.PeggedReference.PEGGED_REFERENCE_MID,
        offset: '0.5',
      },
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[col-id="type"]')
      .should('have.text', 'Mid + 0.00001 Peg limit');
  });

  it('for market typy must not see a price for active or parked orders', () => {
    // 7003-MORD-005
    updateOrder({
      id: orderId,
      type: Schema.OrderType.TYPE_MARKET,
      status: Schema.OrderStatus.STATUS_PARKED,
      peggedOrder: null,
    });
    cy.get(`[row-id=${orderId}]`)
      .find('[col-id="price"]')
      .should('have.text', '-');
  });

  it('must see the time in force applied to the order', () => {
    // 7003-MORD-006
    updateOrder({
      id: orderId,
      type: Schema.OrderType.TYPE_MARKET,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[col-id='${orderTimeInForce}']`)
      .should('have.text', 'GTC');
  });

  it('for Active order when is part of a liquidity or peg shape, must not see an option to amend the individual order ', () => {
    // 7003-MORD-008
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: {},
      liquidityProvisionId: '6536',
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="cancel"]`)
      .should('not.exist');
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="edit"]`)
      .should('not.exist');
  });

  it('for Active order when is part of a liquidity, must not see an option to amend the individual order ', () => {
    // 7003-MORD-008
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: {},
      liquidityProvisionId: '6536',
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="cancel"]`)
      .should('not.exist');
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="edit"]`)
      .should('not.exist');
  });

  it('for Active order when is part of a peg shape, must not see an option to amend the individual order ', () => {
    // 7003-MORD-008
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      peggedOrder: {},
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="cancel"]`)
      .should('not.exist');
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="edit"]`)
      .should('not.exist');
  });
});

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

  // this test is flakey
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
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
          sizeDelta: 0,
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
