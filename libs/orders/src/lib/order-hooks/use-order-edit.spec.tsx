import { act, renderHook } from '@testing-library/react-hooks';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { VegaWalletOrderTimeInForce } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { useOrderEdit } from './use-order-edit';
import type {
  OrderEvent,
  OrderEvent_busEvents,
} from './__generated__/OrderEvent';
import { ORDER_EVENT_SUB } from './order-event-query';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OrderFields } from '../components';
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

function setup(order: OrderFields, context?: Partial<VegaWalletContextShape>) {
  const mocks: MockedResponse<OrderEvent> = {
    request: {
      query: ORDER_EVENT_SUB,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: 'Order',
            event: {
              type: 'Limit',
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: 'Active',
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: 'GTC',
              side: 'Buy',
              market: {
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          } as OrderEvent_busEvents,
        ],
      },
    },
  };
  const filterMocks: MockedResponse<OrderEvent> = {
    request: {
      query: ORDER_EVENT_SUB,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: 'Order',
            event: {
              type: 'Limit',
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: 'Active',
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: 'GTC',
              side: 'Buy',
              market: {
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          } as OrderEvent_busEvents,
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
        timeInForce: VegaWalletOrderTimeInForce[order.timeInForce],
        price: { value: '123456789' }, // Decimal removed
        sizeDelta: 0,
        expiresAt: { value: order.expiresAt }, // Nanoseconds append
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
