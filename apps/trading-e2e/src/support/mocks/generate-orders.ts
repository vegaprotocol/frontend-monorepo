import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { OrdersQuery, OrderFieldsFragment } from '@vegaprotocol/orders';
import { Schema } from '@vegaprotocol/types';

export const generateOrders = (
  override?: PartialDeep<OrdersQuery>
): OrdersQuery => {
  const orders: OrderFieldsFragment[] = [
    {
      __typename: 'Order',
      id: '066468C06549101DAF7BC51099E1412A0067DC08C246B7D8013C9D0CBF1E8EE7',
      market: {
        __typename: 'Market',
        id: 'market-0',
      },
      size: '10',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '20000000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 30).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
      liquidityProvision: null,
      peggedOrder: null,
    },
    {
      __typename: 'Order',
      id: '48DB6767E4E4E0F649C5A13ABFADE39F8451C27DA828DAF14B7A1E8E5EBDAD99',
      market: {
        __typename: 'Market',
        id: 'market-1',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '100',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 29).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
      liquidityProvision: null,
      peggedOrder: null,
    },
    {
      __typename: 'Order',
      id: '4e93702990712c41f6995fcbbd94f60bb372ad12d64dfa7d96d205c49f790336',
      market: {
        __typename: 'Market',
        id: 'market-2',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '20000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 28).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
      liquidityProvision: null,
      peggedOrder: null,
    },
    {
      __typename: 'Order',
      id: '94737d2bafafa4bc3b80a56ef084ae52a983b91aa067c31e243c61a0f962a836',
      market: {
        __typename: 'Market',
        id: 'market-3',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_ACTIVE,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '100000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 27).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
      liquidityProvision: null,
      peggedOrder: null,
    },
    {
      __typename: 'Order',
      id: '94aead3ca92dc932efcb503631b03a410e2a5d4606cae6083e2406dc38e52f78',
      market: {
        __typename: 'Market',
        id: 'market-3',
      },
      size: '10',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_PARTIALLY_FILLED,
      side: Schema.Side.SIDE_SELL,
      remaining: '3',
      price: '100000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 27).toISOString(),
      updatedAt: null,
      expiresAt: null,
      rejectionReason: null,
      liquidityProvision: null,
      peggedOrder: null,
    },
  ];

  const defaultResult: OrdersQuery = {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      ordersConnection: {
        __typename: 'OrderConnection',
        edges: orders.map((f) => {
          return {
            __typename: 'OrderEdge',
            node: f,
            cursor: f.id,
          };
        }),
        pageInfo: {
          __typename: 'PageInfo',
          startCursor:
            '066468C06549101DAF7BC51099E1412A0067DC08C246B7D8013C9D0CBF1E8EE7',
          endCursor:
            '94737d2bafafa4bc3b80a56ef084ae52a983b91aa067c31e243c61a0f962a836',
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      __typename: 'Party',
    },
  };
  return merge(defaultResult, override);
};
