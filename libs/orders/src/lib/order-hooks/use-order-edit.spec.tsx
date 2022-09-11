import { act, renderHook } from '@testing-library/react';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { useOrderEdit } from './use-order-edit';
import type { OrderEvent, OrderEvent_busEvents } from './';
import { ORDER_EVENT_SUB } from './order-event-query';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OrderFields } from '../components';
import { generateOrder } from '../components';
import {
  OrderStatus,
  OrderType,
  OrderTimeInForce,
  Side,
  BusEventType,
} from '@vegaprotocol/types';

const defaultWalletContext = {
  pubKey: null,
  pubKeys: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  connector: null,
};

function setup(order: OrderFields, context?: Partial<VegaWalletContextShape>) {
  const mocks: MockedResponse<OrderEvent> = {
    request: {
      query: ORDER_EVENT_SUB,
      variables: {
        partyId: context?.pubKey || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: BusEventType.Order,
            event: {
              type: OrderType.TYPE_LIMIT,
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: OrderStatus.STATUS_ACTIVE,
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              expiresAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Side.SIDE_BUY,
              market: {
                id: 'market-id',
                decimalPlaces: 5,
                positionDecimalPlaces: 0,
                tradableInstrument: {
                  __typename: 'TradableInstrument',
                  instrument: {
                    name: 'UNIDAI Monthly (30 Jun 2022)',
                    __typename: 'Instrument',
                  },
                },
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          },
        ],
      },
    },
  };
  const filterMocks: MockedResponse<OrderEvent> = {
    request: {
      query: ORDER_EVENT_SUB,
      variables: {
        partyId: context?.pubKey || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: BusEventType.Order,
            event: {
              type: OrderType.TYPE_LIMIT,
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: OrderStatus.STATUS_ACTIVE,
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              expiresAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Side.SIDE_BUY,
              market: {
                id: 'market-id',
                decimalPlaces: 5,
                positionDecimalPlaces: 0,
                tradableInstrument: {
                  __typename: 'TradableInstrument',
                  instrument: {
                    name: 'UNIDAI Monthly (30 Jun 2022)',
                    __typename: 'Instrument',
                  },
                },
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          },
        ],
      },
    },
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[mocks, filterMocks]}>
      <VegaWalletContext.Provider
        value={{ ...defaultWalletContext, ...context }}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useOrderEdit(order), { wrapper });
}

describe('useOrderEdit', () => {
  it('should edit a correctly formatted order', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const pubKey = '0x123';
    const order = generateOrder({
      price: '123456789',
      market: { decimalPlaces: 2 },
    });
    const { result } = setup(order, {
      sendTx: mockSendTx,
      pubKeys: [pubKey],
      pubKey,
    });

    act(() => {
      result.current.edit({ price: '1234567.89' });
    });

    expect(mockSendTx).toHaveBeenCalledWith(pubKey, {
      orderAmendment: {
        orderId: order.id,
        // eslint-disable-next-line
        marketId: order.market!.id,
        timeInForce: order.timeInForce,
        price: '123456789', // Decimal removed
        sizeDelta: 0,
        expiresAt: undefined,
      },
    });
  });

  it('has the correct default state', () => {
    const order = generateOrder();
    const { result } = setup(order);
    expect(typeof result.current.edit).toEqual('function');
    expect(typeof result.current.reset).toEqual('function');
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
    expect(result.current.transaction.txHash).toEqual(null);
    expect(result.current.transaction.error).toEqual(null);
  });

  it('should not sendTx if no keypair', async () => {
    const order = generateOrder();
    const mockSendTx = jest.fn();
    const { result } = setup(order, {
      sendTx: mockSendTx,
      pubKeys: [],
      pubKey: null,
    });
    await act(async () => {
      result.current.edit(order);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });
});
