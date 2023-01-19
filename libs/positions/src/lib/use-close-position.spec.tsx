import type { ReactNode } from 'react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import * as Types from '@vegaprotocol/types';
import { useClosePosition } from './use-close-position';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { initialState } from '@vegaprotocol/wallet';
import type { TransactionEventSubscription } from '@vegaprotocol/wallet';
import { TransactionEventDocument } from '@vegaprotocol/wallet';
import { act } from 'react-dom/test-utils';
import type { OrderEventSubscription } from '@vegaprotocol/orders';
import { OrderEventDocument } from '@vegaprotocol/orders';

const pubKey = 'test-pubkey';
const defaultWalletContext = {
  pubKey,
  pubKeys: [{ publicKey: pubKey, name: 'test pubkey' }],
  isReadOnly: false,
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  connector: null,
};
const txResult = {
  __typename: 'TransactionResult',
  partyId: pubKey,
  hash: '0x123',
  status: true,
  error: null,
};

function setup(context?: Partial<VegaWalletContextShape>) {
  const mockTransactionResult: MockedResponse<TransactionEventSubscription> = {
    request: {
      query: TransactionEventDocument,
      variables: {
        partyId: context?.pubKey || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: Types.BusEventType.TransactionResult,
            event: txResult,
            __typename: 'BusEvent',
          },
        ] as TransactionEventSubscription['busEvents'],
      },
    },
  };
  const mockOrderResult: MockedResponse<OrderEventSubscription> = {
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
            type: Types.BusEventType.Order,
            event: {
              type: Types.OrderType.TYPE_LIMIT,
              id: '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50',
              status: Types.OrderStatus.STATUS_ACTIVE,
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              expiresAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: Types.OrderTimeInForce.TIME_IN_FORCE_GTC,
              side: Types.Side.SIDE_BUY,
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
    <MockedProvider mocks={[mockTransactionResult, mockOrderResult]}>
      <VegaWalletContext.Provider
        value={{ ...defaultWalletContext, ...context }}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useClosePosition(), { wrapper });
}

describe('useClosePosition', () => {
  const txResponse = {
    signature:
      'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909',
    transactionHash: '0x123',
  };

  it('doesnt send the tx if there is no open volume', () => {
    const mockSend = jest.fn();
    const { result } = setup({ sendTx: mockSend });
    expect(result.current).toEqual({
      submit: expect.any(Function),
      transaction: initialState,
      Dialog: expect.any(Function),
    });
    result.current.submit({ marketId: 'test-market', openVolume: '0' });
    expect(mockSend).not.toBeCalled();
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  });

  it('doesnt send the tx if there is no pubkey', () => {
    const mockSend = jest.fn();
    const { result } = setup({ sendTx: mockSend, pubKey: null });
    result.current.submit({ marketId: 'test-market', openVolume: '1000' });
    expect(mockSend).not.toBeCalled();
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  });

  it('closes long positions', async () => {
    const marketId = 'test-market';
    const openVolume = '1000';
    const mockSend = jest.fn().mockResolvedValue(txResponse);
    const { result } = setup({ sendTx: mockSend, pubKey });

    act(() => {
      result.current.submit({ marketId, openVolume });
    });

    expect(mockSend).toBeCalledWith(defaultWalletContext.pubKey, {
      batchMarketInstructions: {
        cancellations: [
          {
            marketId,
            orderId: '',
          },
        ],
        submissions: [
          {
            marketId,
            type: Types.OrderType.TYPE_MARKET,
            timeInForce: Types.OrderTimeInForce.TIME_IN_FORCE_FOK,
            side: Types.Side.SIDE_SELL,
            size: openVolume,
          },
        ],
      },
    });

    expect(result.current.transaction.status).toEqual(VegaTxStatus.Requested);

    await waitFor(() => {
      expect(result.current.transaction).toEqual({
        status: VegaTxStatus.Complete,
        signature: txResponse.signature,
        txHash: txResponse.transactionHash,
        dialogOpen: true,
        error: null,
      });
      expect(result.current.transactionResult).toEqual(txResult);
    });
  });

  it('closes short positions', async () => {
    const marketId = 'test-market';
    const openVolume = '-1000';
    const mockSend = jest.fn().mockResolvedValue(txResponse);
    const { result } = setup({ sendTx: mockSend, pubKey });

    act(() => {
      result.current.submit({ marketId, openVolume });
    });

    expect(mockSend).toBeCalledWith(defaultWalletContext.pubKey, {
      batchMarketInstructions: {
        cancellations: [
          {
            marketId,
            orderId: '',
          },
        ],
        submissions: [
          {
            marketId,
            type: Types.OrderType.TYPE_MARKET,
            timeInForce: Types.OrderTimeInForce.TIME_IN_FORCE_FOK,
            side: Types.Side.SIDE_BUY,
            size: openVolume.replace('-', ''),
          },
        ],
      },
    });

    expect(result.current.transaction.status).toEqual(VegaTxStatus.Requested);

    await waitFor(() => {
      expect(result.current.transaction).toEqual({
        status: VegaTxStatus.Complete,
        signature: txResponse.signature,
        txHash: txResponse.transactionHash,
        dialogOpen: true,
        error: null,
      });
      expect(result.current.transactionResult).toEqual(txResult);
    });
  });
});
