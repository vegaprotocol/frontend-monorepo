import {
  OrderType,
  OrderStatus,
  Side,
  OrderTimeInForce,
} from '@vegaprotocol/types';
import type { Orders_party_orders } from '../__generated__/Orders';
import { sortOrders } from './order-data-provider';

const marketOrder: Orders_party_orders = {
  __typename: 'Order',
  id: 'order-id',
  market: {
    __typename: 'Market',
    id: 'market-id',
    name: 'market-name',
    decimalPlaces: 2,
    positionDecimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'instrument-code',
      },
    },
  },
  size: '10',
  type: OrderType.Market,
  status: OrderStatus.Active,
  side: Side.Buy,
  remaining: '5',
  price: '',
  timeInForce: OrderTimeInForce.IOC,
  createdAt: new Date('2022-2-3').toISOString(),
  updatedAt: null,
  expiresAt: null,
  rejectionReason: null,
};

const limitOrder: Orders_party_orders = {
  __typename: 'Order',
  id: 'order-id',
  market: {
    __typename: 'Market',
    id: 'market-id',
    name: 'market-name',
    decimalPlaces: 2,
    positionDecimalPlaces: 2,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        code: 'instrument-code',
      },
    },
  },
  size: '10',
  type: OrderType.Limit,
  status: OrderStatus.Active,
  side: Side.Sell,
  remaining: '5',
  price: '12345',
  timeInForce: OrderTimeInForce.GTT,
  createdAt: new Date('2022-3-3').toISOString(),
  expiresAt: new Date('2022-3-5').toISOString(),
  updatedAt: null,
  rejectionReason: null,
};

describe('OrderDataProvider', () => {
  const orders = [marketOrder, limitOrder];

  describe('sortOrders', () => {
    it('should sort the orders from the most recent placed to the oldest', () => {
      expect(sortOrders(orders)).toStrictEqual([limitOrder, marketOrder]);
    });

    it('should sort the orders from the most recent updated to the oldest', () => {
      const updatedOrder = {
        ...limitOrder,
        updatedAt: new Date('2022-3-4').toISOString(),
      };
      expect(sortOrders([...orders, updatedOrder])).toStrictEqual([
        updatedOrder,
        limitOrder,
        marketOrder,
      ]);
    });
  });
});
