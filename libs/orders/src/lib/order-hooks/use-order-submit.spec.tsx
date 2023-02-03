import { act, renderHook } from '@testing-library/react';
import type { PubKey, VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import * as Schema from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useOrderSubmit } from './use-order-submit';
import type { OrderSubSubscription } from './';
import { OrderSubDocument } from './';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';

const defaultMarket = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  state: Schema.MarketState.STATE_ACTIVE,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
      },
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: {
      __typename: 'Trade',
      price: '100',
    },
  },
};

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
            __typename: 'Order',
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
      result.current.submit({ ...order, marketId: defaultMarket.id });
    });

    expect(mockSendTx).toHaveBeenCalledWith(pubKey, {
      orderSubmission: {
        type: Schema.OrderType.TYPE_LIMIT,
        marketId: defaultMarket.id,
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
      result.current.submit({ ...order, marketId: defaultMarket.id });
    });

    expect(mockSendTx).toHaveBeenCalledWith(publicKeyObj.publicKey, {
      orderSubmission: {
        type: Schema.OrderType.TYPE_LIMIT,
        marketId: defaultMarket.id,
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
