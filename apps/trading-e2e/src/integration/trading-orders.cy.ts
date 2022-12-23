import * as Schema from '@vegaprotocol/types';
import type { OrderAmendment, OrderCancellation } from '@vegaprotocol/wallet';
import {
  updateOrder,
  getSubscriptionMocks,
} from '../support/mocks/order-update-subscription';
import { cancelOrder, editOrder } from '../support/order-list';

const orderSymbol = 'market.tradableInstrument.instrument.code';
const orderSize = 'size';
const orderType = 'type';
const orderStatus = 'status';
const orderRemaining = 'remaining';
const orderPrice = 'price';
const orderTimeInForce = 'timeInForce';
const orderCreatedAt = 'createdAt';
const cancelOrderBtn = 'cancel';
const cancelAllOrdersBtn = 'cancelAll';
const editOrderBtn = 'edit';

describe('orders list', { tags: '@smoke' }, () => {
  before(() => {
    const subscriptionMocks = getSubscriptionMocks();
    cy.spy(subscriptionMocks, 'OrdersUpdate');
    cy.mockTradingPage();
    cy.mockSubscription(subscriptionMocks);
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Orders').click();
    cy.connectVegaWallet();
    cy.wait('@Orders').then(() => {
      expect(subscriptionMocks.OrdersUpdate).to.be.calledOnce;
    });
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

          cy.get(`[col-id='${orderSize}']`).each(($size) => {
            cy.wrap($size).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderType}']`).each(($type) => {
            cy.wrap($type).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderStatus}']`).each(($status) => {
            cy.wrap($status).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderRemaining}']`).each(($remaining) => {
            cy.wrap($remaining).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderPrice}']`).each(($price) => {
            cy.wrap($price).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderTimeInForce}']`).each(($timeInForce) => {
            cy.wrap($timeInForce).invoke('text').should('not.be.empty');
          });

          cy.get(`[col-id='${orderCreatedAt}']`).each(($dateTime) => {
            cy.wrap($dateTime).invoke('text').should('not.be.empty');
          });
        });
    });
  });

  it('partially filled orders should not show close/edit buttons', () => {
    const partiallyFilledId =
      '94aead3ca92dc932efcb503631b03a410e2a5d4606cae6083e2406dc38e52f78';

    cy.getByTestId('tab-orders').should('be.visible');
    cy.get(`[row-id="${partiallyFilledId}"]`).within(() => {
      cy.get(`[col-id='${orderStatus}']`).should(
        'have.text',
        'PartiallyFilled'
      );
      cy.get(`[col-id='${orderRemaining}']`).should('have.text', '7/10');
      cy.getByTestId(cancelOrderBtn).should('not.exist');
      cy.getByTestId(editOrderBtn).should('not.exist');
    });
  });

  it('orders are sorted by most recent order', () => {
    //7003-MORD-002
    const expectedOrderList = ['BTCUSD.MF21', 'BTCUSD.MF21'];

    cy.getByTestId('tab-orders')
      .get(`.ag-center-cols-container [col-id='${orderSymbol}']`)
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
  before(() => {
    const subscriptionMocks = getSubscriptionMocks();
    cy.spy(subscriptionMocks, 'OrdersUpdate');
    cy.mockTradingPage();
    cy.mockSubscription(subscriptionMocks);
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Orders').click();
    cy.connectVegaWallet();
    cy.wait('@Orders').then(() => {
      expect(subscriptionMocks.OrdersUpdate).to.be.calledOnce;
    });
  });
  const orderId = '1234567890';
  //7002-SORD-053
  //7002-SORD-040
  //7003-MORD-001
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
      'PartiallyFilled'
    );
    cy.getByTestId(`order-status-${orderId}`)
      .parent()
      .siblings(`[col-id=${orderRemaining}]`)
      .should('have.text', '4/5');
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
    // NOT COVERED:   must see an explanation of why parked orders happen
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_PARKED,
    });
    cy.getByTestId(`order-status-${orderId}`).should('have.text', 'Parked');
  });
});

describe('amend and cancel order', { tags: '@smoke' }, () => {
  beforeEach(() => {
    const subscriptionMocks = getSubscriptionMocks();
    cy.spy(subscriptionMocks, 'OrdersUpdate');
    cy.mockTradingPage();
    cy.mockSubscription(subscriptionMocks);
    cy.visit('/#/markets/market-0');
    cy.getByTestId('Orders').click();
    cy.connectVegaWallet();
    cy.wait('@Orders').then(() => {
      expect(subscriptionMocks.OrdersUpdate).to.be.calledOnce;
    });
    cy.mockVegaWalletTransaction();
  });

  const orderId = '1234567890';
  it('must be able to amend the price of an order', () => {
    //7003-MORD-012
    //7003-MORD-014
    //7003-MORD-015
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
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
        editOrder(order);
      });
  });
  it('must be able to cancel an individual order', () => {
    //7003-MORD-009
    //7003-MORD-010
    //7003-MORD-011
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
    });
    cy.get(`[row-id=${orderId}]`)
      .find(`[data-testid="cancel"]`)
      .should('have.text', 'Cancel')
      .then(($btn) => {
        cy.wrap($btn).click();
        const order: OrderCancellation = {
          orderId: orderId,
          marketId: 'market-0',
        };
        cancelOrder(order);
      });
  });
  it('must be able to cancel all orders on a market', () => {
    updateOrder({
      id: orderId,
      status: Schema.OrderStatus.STATUS_ACTIVE,
    });
    cy.get(`[data-testid="cancelAll"]`)
      .should('have.text', 'Cancel all')
      .then(($btn) => {
        cy.wrap($btn).click();
        const order: OrderCancellation = {
          marketId: 'market-0',
        };
        cancelOrder(order);
      });
  });
});
