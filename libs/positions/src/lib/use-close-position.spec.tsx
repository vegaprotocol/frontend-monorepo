import type { ReactNode } from 'react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import {
  OrderTimeInForce,
  OrderType,
  Schema as Types,
  Side,
} from '@vegaprotocol/types';
import { useClosePosition } from './use-close-position';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { initialState } from '@vegaprotocol/wallet';
import type { TransactionEventSubscription } from './__generated___/TransactionResult';
import { TransactionEventDocument } from './__generated___/TransactionResult';
import { act } from 'react-dom/test-utils';

const pubKey = 'test-pubkey';
const defaultWalletContext = {
  pubKey,
  pubKeys: [{ publicKey: pubKey, name: 'test pubkey' }],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  connector: null,
};

function setup(context?: Partial<VegaWalletContextShape>) {
  const mock: MockedResponse<TransactionEventSubscription> = {
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
            event: {
              __typename: 'TransactionResult',
              partyId: context?.pubKey,
              hash: '0x123',
              status: true,
              error: null,
            },
            __typename: 'BusEvent',
          },
        ] as TransactionEventSubscription['busEvents'],
      },
    },
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[mock]}>
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
  });

  it('doesnt send the tx if there is no pubkey', () => {
    const mockSend = jest.fn();
    const { result } = setup({ sendTx: mockSend, pubKey: null });
    result.current.submit({ marketId: 'test-market', openVolume: '1000' });
    expect(mockSend).not.toBeCalled();
  });

  it('closes long positions', async () => {
    const marketId = 'test-market';
    const openVolume = '1000';
    const txResponse = {
      signature: '12345',
      transactionHash: '0x123',
    };
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
            type: OrderType.TYPE_MARKET,
            timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
            side: Side.SIDE_SELL,
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
    });
  });

  it('closes short positions', async () => {
    const marketId = 'test-market';
    const openVolume = '-1000';
    const txResponse = {
      signature: '12345',
      transactionHash: '0x123',
    };
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
            type: OrderType.TYPE_MARKET,
            timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
            side: Side.SIDE_BUY,
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
    });
  });
});
