import * as Schema from '@vegaprotocol/types';
import { testOrderSubmission } from '../support/order-validation';
import { createOrder } from '../support/create-order';
import type { OrderObj } from '@vegaprotocol/orders';

const displayTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().substring(0, 16);
};

describe(
  'must submit order for market in monitoring auction',
  { tags: '@regression' },
  () => {
    before(() => {
      cy.setVegaWallet();
      cy.mockTradingPage(
        Schema.MarketState.STATE_SUSPENDED,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
      );
      cy.mockSubscription();
      cy.visit('/#/markets/market-0');
      cy.wait('@Markets');
    });

    beforeEach(() => {
      cy.setVegaWallet();
    });

    it('successfully places limit buy order', () => {
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
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        size: '100',
        price: '50000',
        postOnly: false,
        reduceOnly: false,
      };
      createOrder(order);
      testOrderSubmission(order, { price: '5000000000' });
    });

    it('successfully places GTT limit buy order', () => {
      cy.mockVegaWalletTransaction();
      const order: OrderObj = {
        marketId: 'market-0',
        type: Schema.OrderType.TYPE_LIMIT,
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        size: '100',
        price: '1.00',
        expiresAt: displayTomorrow(),
        postOnly: false,
        reduceOnly: false,
      };
      createOrder(order);
      testOrderSubmission(order, {
        price: '100000',
        expiresAt:
          new Date(order.expiresAt as string).getTime().toString() + '000000',
      });
    });
  }
);
