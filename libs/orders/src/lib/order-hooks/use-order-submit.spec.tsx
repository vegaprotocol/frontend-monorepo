import { act, renderHook } from '@testing-library/react';
import type { PubKey, VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import * as Schema from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useOrderSubmit } from './use-order-submit';
import type { OrderEventSubscription } from './';
import { OrderEventDocument } from './';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';

const marketId = 'market-id';

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
  const mocks: MockedResponse<OrderEventSubscription> = {
    request: {
      query: OrderEventDocument,
      variables: {
        partyId: context?.pubKey || '',
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
              expiresAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Schema.Side.SIDE_BUY,
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
  const filterMocks: MockedResponse<OrderEventSubscription> = {
    request: {
      query: OrderEventDocument,
      variables: {
        partyId: context?.pubKey || '',
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
              expiresAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Schema.Side.SIDE_BUY,
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
  return renderHook(() => useOrderSubmit(), { wrapper });
}

describe('useOrderSubmit', () => {
  it('should submit a correctly formatted order on GTT', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const pubKey = '0x123';
    const { result } = setup({
      sendTx: mockSendTx,
      pubKeys: [{ publicKey: pubKey, name: 'test key 1' }],
      pubKey,
    });

    const order = {
      type: Schema.OrderType.TYPE_LIMIT,
      size: '10',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
      side: Schema.Side.SIDE_BUY,
      price: '123456789',
      expiresAt: new Date('2022-01-01').toISOString(),
    };
    await act(async () => {
      result.current.submit({ ...order, marketId });
    });

    expect(mockSendTx).toHaveBeenCalledWith(pubKey, {
      orderSubmission: {
        type: Schema.OrderType.TYPE_LIMIT,
        marketId,
        size: '10',
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        price: '123456789',
        expiresAt: new Date('2022-01-01').toISOString(),
      },
    });
  });

  it('should submit a correctly formatted order on GTC', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const publicKeyObj: PubKey = {
      publicKey: '0x123',
      name: 'test key 1',
    };
    const { result } = setup({
      sendTx: mockSendTx,
      pubKeys: [publicKeyObj],
      pubKey: publicKeyObj.publicKey,
    });

    const order = {
      type: Schema.OrderType.TYPE_LIMIT,
      size: '10',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      side: Schema.Side.SIDE_BUY,
      price: '123456789',
      expiresAt: new Date('2022-01-01').toISOString(),
    };
    await act(async () => {
      result.current.submit({ ...order, marketId });
    });

    expect(mockSendTx).toHaveBeenCalledWith(publicKeyObj.publicKey, {
      orderSubmission: {
        type: Schema.OrderType.TYPE_LIMIT,
        marketId,
        size: '10',
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        price: '123456789',
        expiresAt: new Date('2022-01-01').toISOString(),
      },
    });
  });

  it('has the correct default state', () => {
    const { result } = setup();
    expect(typeof result.current.submit).toEqual('function');
    expect(typeof result.current.reset).toEqual('function');
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
    expect(result.current.transaction.txHash).toEqual(null);
    expect(result.current.transaction.error).toEqual(null);
  });

  it('should not sendTx if no keypair', async () => {
    const mockSendTx = jest.fn();
    const { result } = setup({
      sendTx: mockSendTx,
      pubKeys: [],
      pubKey: null,
    });
    await act(async () => {
      result.current.submit({} as OrderSubmissionBody['orderSubmission']);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });

  it('should not sendTx side is not specified', async () => {
    const mockSendTx = jest.fn();
    const publicKeyObj: PubKey = {
      publicKey: '0x123',
      name: 'test key 1',
    };
    const { result } = setup({
      sendTx: mockSendTx,
      pubKeys: [publicKeyObj],
      pubKey: publicKeyObj.publicKey,
    });
    await act(async () => {
      result.current.submit({} as OrderSubmissionBody['orderSubmission']);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });
});
