import { act, renderHook } from '@testing-library/react';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import { Schema } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import type { Order } from './use-order-submit';
import { useOrderSubmit } from './use-order-submit';
import { OrderBusEventDocument } from './__generated__/Orders';
import type { OrderBusEventSubscription } from './__generated__/Orders';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { toNanoSeconds } from '@vegaprotocol/react-helpers';

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
  keypair: null,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(context?: Partial<VegaWalletContextShape>) {
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
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });

    const order = {
      type: Schema.OrderType.TYPE_LIMIT,
      size: '10',
      remaining: '1',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
      side: Schema.Side.SIDE_BUY,
      price: '123456789',
      expiresAt: new Date('2022-01-01'),
    };
    await act(async () => {
      result.current.submit({ ...order, marketId: defaultMarket.id });
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      pubKey: keypair.pub,
      propagate: true,
      orderSubmission: {
        type: Schema.OrderType.TYPE_LIMIT,
        marketId: defaultMarket.id,
        size: '10',
        remaining: '1',
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        price: '123456789',
        expiresAt: toNanoSeconds(order.expiresAt),
      },
    });
  });

  it('should submit a correctly formatted order on GTC', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });

    const order = {
      type: Schema.OrderType.TYPE_LIMIT,
      size: '10',
      remaining: '1',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      side: Schema.Side.SIDE_BUY,
      price: '123456789',
      expiresAt: new Date('2022-01-01'),
    };
    await act(async () => {
      result.current.submit({ ...order, marketId: defaultMarket.id });
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      pubKey: keypair.pub,
      propagate: true,
      orderSubmission: {
        type: Schema.OrderType.TYPE_LIMIT,
        marketId: defaultMarket.id,
        size: '10',
        remaining: '1',
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        price: '123456789',
        expiresAt: undefined,
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
      keypairs: [],
      keypair: null,
    });
    await act(async () => {
      result.current.submit({} as Order);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });

  it('should not sendTx side is not specified', async () => {
    const mockSendTx = jest.fn();
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });
    await act(async () => {
      result.current.submit({} as Order);
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });
});
