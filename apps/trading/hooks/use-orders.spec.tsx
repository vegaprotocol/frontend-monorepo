import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import {
  OrderFields,
  Orders,
  OrderStatus,
  OrderSub,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/graphql';
import {
  VegaKeyExtended,
  VegaWalletContext,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { ReactNode } from 'react';
import { ORDERS_QUERY, ORDERS_SUB, useOrdersImpl } from './use-orders';

const keypair = { pub: '0x123' } as VegaKeyExtended;
const defaultWalletContext = {
  keypair,
  keypairs: [keypair],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

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

function setup(
  context?: Partial<VegaWalletContextShape>,
  mocks: MockedResponse[] = []
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>
      <VegaWalletContext.Provider
        value={{ ...defaultWalletContext, ...context }}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useOrdersImpl(), { wrapper });
}

test('Fetches and subscribes to orders and merges appropriately', async () => {
  const order = generateOrder();
  const mockOrderQuery: MockedResponse<Orders> = {
    request: {
      query: ORDERS_QUERY,
      variables: { partyId: keypair.pub },
    },
    result: {
      data: {
        party: {
          __typename: 'Party',
          id: keypair.pub,
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
      variables: { partyId: keypair.pub },
    },
    result: {
      data: {
        orders: [updatedOrder, newOrder],
      },
    },
    delay: 100,
  };
  const { result, waitForNextUpdate } = setup(defaultWalletContext, [
    mockOrderQuery,
    mockOrderSub,
  ]);
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
      variables: { partyId: keypair.pub },
    },
    error,
  };
  const { result, waitForNextUpdate } = setup(defaultWalletContext, [
    mockFailedOrderQuery,
  ]);
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
      variables: { partyId: keypair.pub },
    },
    newData: jest.fn(),
  };
  const { result } = setup(
    { ...defaultWalletContext, keypair: null, keypairs: [] },
    [mockQuery]
  );
  expect(mockQuery.newData).not.toBeCalled();
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(null);
});
