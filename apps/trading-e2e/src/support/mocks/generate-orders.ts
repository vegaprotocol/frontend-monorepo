import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { Orders, Orders_party_orders } from '@vegaprotocol/order-list';
import {
  OrderStatus,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';

export const generateOrders = (override?: PartialDeep<Orders>): Orders => {
  const orders: Orders_party_orders[] = [
    {
      __typename: 'Order',
      id: '066468C06549101DAF7BC51099E1412A0067DC08C246B7D8013C9D0CBF1E8EE7',
      market: {
        __typename: 'Market',
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
        name: 'AAVEDAI Monthly (30 Jun 2022)',
        decimalPlaces: 5,
        positionDecimalPlaces: 0,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            code: 'AAVEDAI.MF21',
          },
        },
      },
      size: '10',
      type: OrderType.Limit,
      status: OrderStatus.Filled,
      side: Side.Buy,
      remaining: '0',
      price: '20000000',
      timeInForce: OrderTimeInForce.GTC,
      createdAt: new Date(2020, 1, 1).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
    },
    {
      __typename: 'Order',
      id: '48DB6767E4E4E0F649C5A13ABFADE39F8451C27DA828DAF14B7A1E8E5EBDAD99',
      market: {
        __typename: 'Market',
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
        name: 'Tesla Quarterly (30 Jun 2022)',
        decimalPlaces: 5,
        positionDecimalPlaces: 0,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            code: 'TSLA.QM21',
          },
        },
      },
      size: '1',
      type: OrderType.Limit,
      status: OrderStatus.Filled,
      side: Side.Buy,
      remaining: '0',
      price: '100',
      timeInForce: OrderTimeInForce.GTC,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
    },
    {
      __typename: 'Order',
      id: '4e93702990712c41f6995fcbbd94f60bb372ad12d64dfa7d96d205c49f790336',
      market: {
        __typename: 'Market',
        id: 'c6f4337b31ed57a961969c3ba10297b369d01b9e75a4cbb96db4fc62886444e6',
        name: 'BTCUSD Monthly (30 Jun 2022)',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            code: 'BTCUSD.MF21',
          },
        },
      },
      size: '1',
      type: OrderType.Limit,
      status: OrderStatus.Filled,
      side: Side.Buy,
      remaining: '0',
      price: '20000',
      timeInForce: OrderTimeInForce.GTC,
      createdAt: new Date(2022, 5, 10).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
    },
  ];

  const defaultResult = {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      orders,
      __typename: 'Party',
    },
  };
  return merge(defaultResult, override);
};
