import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { Order } from '../';
import type { PartialDeep } from 'type-fest';

export const generateOrder = (partialOrder?: PartialDeep<Order>) => {
  const order: Order = {
    __typename: 'Order',
    id: 'order-id2',
    market: {
      __typename: 'Market',
      id: 'market-id',
    },
    size: '10',
    type: Schema.OrderType.TYPE_MARKET,
    status: Schema.OrderStatus.STATUS_ACTIVE,
    side: Schema.Side.SIDE_BUY,
    remaining: '5',
    price: '',
    timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    expiresAt: null,
    rejectionReason: null,
    liquidityProvision: null,
    peggedOrder: null,
  };
  return merge(order, partialOrder);
};

export const limitOrder = generateOrder({
  id: 'limit-order',
  type: Schema.OrderType.TYPE_LIMIT,
  status: Schema.OrderStatus.STATUS_ACTIVE,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
  createdAt: new Date(2022, 3, 3).toISOString(),
  expiresAt: new Date(2022, 3, 5).toISOString(),
});

export const marketOrder = generateOrder({
  id: 'market-order',
  type: Schema.OrderType.TYPE_MARKET,
  status: Schema.OrderStatus.STATUS_ACTIVE,
});

export const generateMockOrders = (): Order[] => {
  return [
    generateOrder({
      id: '066468C06549101DAF7BC51099E1412A0067DC08C246B7D8013C9D0CBF1E8EE7',
      market: {
        __typename: 'Market',
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
      },
      size: '10',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '20000000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 1).toISOString(),
    }),
    generateOrder({
      id: '48DB6767E4E4E0F649C5A13ABFADE39F8451C27DA828DAF14B7A1E8E5EBDAD99',
      market: {
        __typename: 'Market',
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '100',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date().toISOString(),
    }),
    generateOrder({
      id: '4e93702990712c41f6995fcbbd94f60bb372ad12d64dfa7d96d205c49f790336',
      market: {
        __typename: 'Market',
        id: 'c6f4337b31ed57a961969c3ba10297b369d01b9e75a4cbb96db4fc62886444e6',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '20000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2022, 5, 10).toISOString(),
    }),
  ];
};

export const generateOrdersArray = (): Order[] => {
  return [marketOrder, limitOrder, ...generateMockOrders()];
};
