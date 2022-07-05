import { act, renderHook } from '@testing-library/react-hooks';
import type { Order } from '../utils/get-default-order';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import { OrderSide, OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { useOrderSubmit } from './use-order-submit';
import type { DealTicketQuery_market } from '../components/__generated__/DealTicketQuery';
import type { OrderEvent, OrderEvent_busEvents } from '@vegaprotocol/orders';
import { ORDER_EVENT_SUB } from '@vegaprotocol/orders';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';

const defaultMarket = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: MarketTradingMode.Continuous,
  state: MarketState.Active,
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
} as DealTicketQuery_market;

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
  context?: Partial<VegaWalletContextShape>,
  market = defaultMarket
) {
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
  return renderHook(() => useOrderSubmit(market), { wrapper });
}

describe('useOrderSubmit', () => {
  it('should submit a correctly formatted order', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });

    const order: Order = {
      type: OrderType.Limit,
      size: '10',
      timeInForce: OrderTimeInForce.GTT,
      side: OrderSide.Buy,
      price: '1234567.89',
      expiration: new Date('2022-01-01'),
    };
    await act(async () => {
      result.current.submit(order);
    });

    expect(mockSendTx).toHaveBeenCalledWith({
      pubKey: keypair.pub,
      propagate: true,
      orderSubmission: {
        type: OrderType.Limit,
        marketId: defaultMarket.id, // Market provided from hook argument
        size: '100', // size adjusted based on positionDecimalPlaces
        side: OrderSide.Buy,
        timeInForce: OrderTimeInForce.GTT,
        price: '123456789', // Decimal removed
        expiresAt: order.expiration?.getTime() + '000000', // Nanoseconds append
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

  it('create an Id if a signature is returned', async () => {
    const signature =
      '597a7706491e6523c091bab1e4d655b62c45a224e80f6cd92ac366aa5dd9a070cc7dd3c6919cb07b81334b876c662dd43bdbe5e827c8baa17a089feb654fab0b';
    const expectedId =
      '2fe09b0e2e6ed35f8883802629c7d609d3cc2fc9ce3cec0b7824a0d581bd3747';
    const successObj = {
      tx: {
        inputData: 'input-data',
        signature: {
          algo: 'algo',
          version: 1,
          value: signature,
        },
      },
      txHash: '0x123',
    };
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(successObj));
    const keypair = {
      pub: '0x123',
    } as VegaKeyExtended;
    const { result } = setup({
      sendTx: mockSendTx,
      keypairs: [keypair],
      keypair,
    });
    await act(async () => {
      result.current.submit({
        type: OrderType.Market,
        side: OrderSide.Buy,
        size: '1',
        timeInForce: OrderTimeInForce.FOK,
      });
    });
    expect(result.current.id).toEqual(expectedId);
  });
});
