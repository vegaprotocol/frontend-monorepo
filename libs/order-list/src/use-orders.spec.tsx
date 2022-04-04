import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import type { OrderFields } from './__generated__/OrderFields';
import type { Orders } from './__generated__/Orders';
import type { OrderSub } from './__generated__/OrderSub';
import {
  OrderStatus,
  Side,
  OrderType,
  OrderTimeInForce,
} from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { ORDERS_QUERY, ORDERS_SUB, useOrders } from './use-orders';

const partyId = '0x123';

function generateOrder(order?: Partial<OrderFields>): OrderFields {
  return {
    __typename: 'Order',
    id: '1',
    market: {
      __typename: 'Market',
      id: 'market-id',
      name: 'market-name',
      decimalPlaces: 0,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          code: 'instrument-code',
        },
      },
    },
    type: OrderType.Market,
    side: Side.Buy,
    size: '10',
    status: OrderStatus.Active,
    rejectionReason: null,
    price: '',
    timeInForce: OrderTimeInForce.GTC,
    remaining: '10',
    createdAt: '2022-01-01T00:00:00',
    updatedAt: null,
    expiresAt: null,
    ...order,
  };
}

function setup(mocks: MockedResponse[] = [], id: string | null) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useOrders(id as string), { wrapper });
}

test('Fetches and subscribes to orders and merges appropriately', async () => {
  const order = generateOrder();
  const mockOrderQuery: MockedResponse<Orders> = {
    request: {
      query: ORDERS_QUERY,
      variables: { partyId },
    },
    result: {
      data: {
        party: {
          __typename: 'Party',
          id: partyId,
          orders: [order],
        },
      },
    },
  };

  const updatedOrder = generateOrder({
    id: '1',
    remaining: '5',
    updatedAt: '2022-01-01T00:01:00',
  });
  const newOrder = generateOrder({
    id: '2',
    createdAt: '2022-01-01T01:00:00',
  });
  const mockOrderSub: MockedResponse<OrderSub> = {
    request: {
      query: ORDERS_SUB,
      variables: { partyId },
    },
    result: {
      data: {
        orders: [updatedOrder, newOrder],
      },
    },
    delay: 100,
  };
  const { result, waitForNextUpdate } = setup(
    [mockOrderQuery, mockOrderSub],
    partyId
  );
  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBe(null);
  await waitForNextUpdate();
  expect(result.current.orders).toEqual([order]);
  expect(result.current.loading).toBe(false);
  await waitForNextUpdate();
  expect(result.current.orders).toEqual([newOrder, updatedOrder]);
});

test('Returns an error if fetch fails', async () => {
  const error = new Error('Something failed');
  const mockFailedOrderQuery: MockedResponse<Orders> = {
    request: {
      query: ORDERS_QUERY,
      variables: { partyId },
    },
    error,
  };
  const { result, waitForNextUpdate } = setup([mockFailedOrderQuery], partyId);
  expect(result.current.loading).toBe(true);
  expect(result.current.error).toBe(null);
  await waitForNextUpdate();
  expect(result.current.error).toEqual(error);
  expect(result.current.loading).toBe(false);
});

test('No queries are made if no pubkey provided', () => {
  const mockQuery: MockedResponse<Orders> = {
    request: {
      query: ORDERS_QUERY,
      variables: { partyId },
    },
    newData: jest.fn(),
  };
  const { result } = setup([mockQuery], null);
  expect(mockQuery.newData).not.toBeCalled();
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(null);
});
