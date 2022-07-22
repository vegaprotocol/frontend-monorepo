import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react-hooks';
import { MarketState, MarketTradingMode, OrderType } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { useOrderCancel } from './use-order-cancel';
import type {
  OrderEvent,
  OrderEvent_busEvents,
} from './__generated__/OrderEvent';
import { ORDER_EVENT_SUB } from './order-event-query';

const defaultMarket = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: MarketTradingMode.Continuous,
  state: MarketState.Active,
  name: 'market-name',
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
      keypairs: [],
      keypair: null,
    });
    act(() => {
      result.current.cancel({ orderId: 'order-id', marketId: 'market-id' });
    });
    expect(mockSendTx).not.toHaveBeenCalled();
  });

  it('should cancel a correctly formatted order', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });

    const args = {
      orderId: 'order-id',
      marketId: 'market-id',
    };
    act(() => {
      result.current.cancel(args);
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      pubKey: keypair.pub,
      propagate: true,
      orderCancellation: args,
    });
  });
});
