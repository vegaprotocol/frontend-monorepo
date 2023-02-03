import { act, renderHook } from '@testing-library/react';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { useOrderEdit } from './use-order-edit';
import type { OrderSubSubscription } from './__generated__/OrdersSubscription';
import { OrderSubDocument } from './__generated__/OrdersSubscription';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { Order } from '../components';
import { generateOrder } from '../components';
import * as Schema from '@vegaprotocol/types';

const defaultWalletContext = {
  pubKey: null,
  pubKeys: [],
  isReadOnly: false,
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  connector: null,
};

function setup(order: Order, context?: Partial<VegaWalletContextShape>) {
  const mocks: MockedResponse<OrderSubSubscription> = {
    request: {
      query: OrderSubDocument,
      variables: {
        partyId: context?.pubKey || '',
      },
    },
    result: {
      data: {
        orders: [
          {
            type: Schema.OrderType.TYPE_LIMIT,
            id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
            status: Schema.OrderStatus.STATUS_ACTIVE,
            rejectionReason: null,
            createdAt: '2022-07-05T14:25:47.815283706Z',
            expiresAt: '2022-07-05T14:25:47.815283706Z',
            size: '10',
            price: '300000',
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
            side: Schema.Side.SIDE_BUY,
            marketId: 'market-id',
            __typename: 'OrderUpdate',
          },
        ],
      },
    },
  };
  const filterMocks: MockedResponse<OrderSubSubscription> = {
    request: {
      query: OrderSubDocument,
      variables: {
        partyId: context?.pubKey || '',
      },
    },
    result: {
      data: {
        orders: [
          {
            type: Schema.OrderType.TYPE_LIMIT,
            id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
            status: Schema.OrderStatus.STATUS_ACTIVE,
            rejectionReason: null,
            createdAt: '2022-07-05T14:25:47.815283706Z',
            expiresAt: '2022-07-05T14:25:47.815283706Z',
            size: '10',
            price: '300000',
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
            side: Schema.Side.SIDE_BUY,
            marketId: 'market-id',
            __typename: 'OrderUpdate',
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
  it('should edit a correctly formatted order if there is no size', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const pubKeyObj = { publicKey: '0x123', name: 'test key 1' };
    const order = generateOrder({
      price: '123456789',
      market: { decimalPlaces: 2 },
    });
    const { result } = setup(order, {
      sendTx: mockSendTx,
      pubKeys: [pubKeyObj],
      pubKey: pubKeyObj.publicKey,
    });

    act(() => {
      result.current.edit({ price: '1234567.89' });
    });

    expect(mockSendTx).toHaveBeenCalledWith(pubKeyObj.publicKey, {
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

  it('should edit a correctly formatted order', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const pubKeyObj = { publicKey: '0x123', name: 'test key 1' };
    const order = generateOrder({
      price: '123456789',
      market: { decimalPlaces: 2 },
    });
    const { result } = setup(order, {
      sendTx: mockSendTx,
      pubKeys: [pubKeyObj],
      pubKey: pubKeyObj.publicKey,
    });

    act(() => {
      result.current.edit({ price: '1234567.89', size: '20' });
    });

    expect(mockSendTx).toHaveBeenCalledWith(pubKeyObj.publicKey, {
      orderAmendment: {
        orderId: order.id,
        // eslint-disable-next-line
        marketId: order.market!.id,
        timeInForce: order.timeInForce,
        price: '123456789', // Decimal removed
        sizeDelta: 1990,
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
