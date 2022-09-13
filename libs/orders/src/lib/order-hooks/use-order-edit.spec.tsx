import { act, renderHook } from '@testing-library/react';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import { Schema } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { useOrderEdit } from './use-order-edit';
import { OrderBusEventDocument } from './__generated__/Orders';
import type {
  OrderBusEventSubscription,
  OrderFieldsFragment,
} from './__generated__/Orders';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { generateOrder } from '../components';

const defaultWalletContext = {
  keypair: null,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(
  order: OrderFieldsFragment,
  context?: Partial<VegaWalletContextShape>
) {
  const mocks: MockedResponse<OrderBusEventSubscription> = {
    request: {
      query: OrderBusEventDocument,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: Schema.BusEventType.Order,
            event: {
              type: Schema.OrderType.TYPE_LIMIT,
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: Schema.OrderStatus.STATUS_ACTIVE,
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              remaining: '1',
              price: '300000',
              timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Schema.Side.SIDE_BUY,
              market: {
                id: '1',
                decimalPlaces: 5,
                positionDecimalPlaces: 0,
                name: 'UNIDAI Monthly (30 Jun 2022)',
                tradableInstrument: {
                  instrument: {
                    id: '001',
                    name: 'UNIDAI',
                    code: 'UNIDAI',
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
  const filterMocks: MockedResponse<OrderBusEventSubscription> = {
    request: {
      query: OrderBusEventDocument,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: Schema.BusEventType.Order,
            event: {
              type: Schema.OrderType.TYPE_LIMIT,
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: Schema.OrderStatus.STATUS_ACTIVE,
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              remaining: '1',
              price: '300000',
              timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Schema.Side.SIDE_BUY,
              market: {
                id: '2',
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                positionDecimalPlaces: 0,
                tradableInstrument: {
                  instrument: {
                    id: '001',
                    name: 'UNIDAI',
                    code: 'UNIDAI',
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
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const order = generateOrder({
      price: '123456789',
      market: { decimalPlaces: 2 },
    });
    const { result } = setup(order, {
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });

    act(() => {
      result.current.edit({ price: '1234567.89' });
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      pubKey: keypair.pub,
      propagate: true,
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
      keypairs: [],
      keypair: null,
    });
    await act(async () => {
      result.current.edit(order);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });
});
