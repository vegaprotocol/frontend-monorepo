import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { useOrderCancel } from './use-order-cancel';
import type { OrderSubSubscription } from './';
import { OrderSubDocument } from './';
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

function setup(context?: Partial<VegaWalletContextShape>) {
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

  return renderHook(() => useOrderCancel(), { wrapper });
}

describe('useOrderCancel', () => {
  it('has the correct default state', () => {
    const { result } = setup();
    expect(typeof result.current.cancel).toEqual('function');
    expect(typeof result.current.reset).toEqual('function');
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
    expect(result.current.transaction.txHash).toEqual(null);
    expect(result.current.transaction.error).toEqual(null);
  });

  it('should not sendTx if no keypair', () => {
    const mockSendTx = jest.fn();
    const { result } = setup({
      sendTx: mockSendTx,
      pubKeys: [],
      pubKey: null,
    });
    act(() => {
      result.current.cancel({ orderId: 'order-id', marketId: 'market-id' });
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });

  it('should cancel a correctly formatted order', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const pubKeyObj = { publicKey: '0x123', name: 'test key 1' };
    const { result } = setup({
      sendTx: mockSendTx,
      pubKeys: [pubKeyObj],
      pubKey: pubKeyObj.publicKey,
    });

    const args = {
      orderId: 'order-id',
      marketId: 'market-id',
    };
    act(() => {
      result.current.cancel(args);
    });

    expect(mockSendTx).toHaveBeenCalledWith(pubKeyObj.publicKey, {
      orderCancellation: args,
    });
  });
});
