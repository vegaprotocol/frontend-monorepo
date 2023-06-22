import * as Schema from '@vegaprotocol/types';
import { testOrderSubmission } from '../support/order-validation';
import { createOrder } from '../support/create-order';
import type { OrderObj } from '@vegaprotocol/orders';

describe('must submit order', { tags: '@smoke' }, () => {
  // 7002-SORD-039
  before(() => {
    cy.setVegaWallet();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/market-0');
    cy.wait('@Markets');
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('successfully places market buy order', () => {
    // 7002-SORD-010
    // 0003-WTXN-012
    // 0003-WTXN-003
    cy.mockVegaWalletTransaction();
    const order: OrderObj = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_BUY,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
      postOnly: false,
      reduceOnly: false,
      size: '100',
    };
    createOrder(order);
    testOrderSubmission(order);
  });

  it('successfully places market sell order', () => {
    cy.mockVegaWalletTransaction();
    const order: OrderObj = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      size: '100',
      postOnly: false,
      reduceOnly: false,
    };
    createOrder(order);
    testOrderSubmission(order);
  });

  it('successfully places limit buy order', () => {
    // 7002-SORD-017
    cy.mockVegaWalletTransaction();
    const order: OrderObj = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_BUY,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      size: '100',
      postOnly: false,
      reduceOnly: false,
      price: '200',
    };
    createOrder(order);
    testOrderSubmission(order, { price: '20000000' });
  });

  it('successfully places limit sell order', () => {
    cy.mockVegaWalletTransaction();
    const order: OrderObj = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GFN,
      size: '100',
      postOnly: false,
      reduceOnly: false,
      price: '50000',
    };
    createOrder(order);
    testOrderSubmission(order, { price: '5000000000' });
  });

  it('successfully places GTT limit buy order', () => {
    cy.mockVegaWalletTransaction();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const order: OrderObj = {
      marketId: 'market-0',
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
      size: '100',
      price: '1.00',
      expiresAt: expiresAt.toISOString().substring(0, 16),
      postOnly: false,
      reduceOnly: false,
    };
    createOrder(order);
    testOrderSubmission(order, {
      price: '100000',
      expiresAt: order.expiresAt as string,
      postOnly: false,
      reduceOnly: false,
    });
  });
});
