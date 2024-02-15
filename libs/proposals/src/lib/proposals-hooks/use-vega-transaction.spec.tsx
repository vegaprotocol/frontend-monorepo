import { act, renderHook } from '@testing-library/react';
import type { Transaction } from '@vegaprotocol/wallet';
import {
  initialState,
  useVegaTransaction,
  VegaTxStatus,
} from './use-vega-transaction';
import * as walletHooks from '@vegaprotocol/wallet-react';

jest.mock('@vegaprotocol/wallet-react');

const mockPubKey = '0x123';

const defaultHookValues = {
  pubKey: null,
  pubKeys: [],
  isReadOnly: false,
  sendTx: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
};

function setup(hookValues?: Partial<typeof defaultHookValues>) {
  // @ts-ignore wrong types from mock
  walletHooks.useVegaWallet.mockReturnValue({
    ...defaultHookValues,
    ...hookValues,
  });
  return renderHook(() => useVegaTransaction());
}

describe('useVegaTransaction', () => {
  it('has the correct default state', () => {
    const { result } = setup();
    expect(result.current).toEqual({
      transaction: initialState,
      send: expect.any(Function),
      reset: expect.any(Function),
      setComplete: expect.any(Function),
      setTransaction: expect.any(Function),
    });
  });

  it('resets state if sendTx returns null (user rejects)', async () => {
    const mockSendTx = jest
      .fn()
      .mockReturnValue(Promise.resolve({ error: 'user rejected' }));
    const { result } = setup({ sendTx: mockSendTx });
    await act(async () => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  });

  it('handles a single error', () => {
    const error = new Error('test error');
    const mockSendTx = jest.fn(() => {
      throw error;
    });
    const { result } = setup({ sendTx: mockSendTx });
    act(() => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
    expect(result.current.transaction.error).toHaveProperty(
      'message',
      error.message
    );
  });

  it('handles an unknown error', () => {
    const unknownThrow = { foo: 'bar' };
    const mockSendTx = jest.fn(() => {
      throw unknownThrow;
    });
    const { result } = setup({ sendTx: mockSendTx });
    act(() => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
    expect(result.current.transaction.error).toHaveProperty(
      'message',
      'something went wrong'
    );
  });

  it('sets txHash and signature to state if successful', async () => {
    const successObj = {
      transactionHash: '0x123',
      signature: 'signature',
    };
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(successObj));
    const { result } = setup({ sendTx: mockSendTx });
    await act(async () => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Pending);
    expect(result.current.transaction.txHash).toEqual(
      successObj.transactionHash
    );
    expect(result.current.transaction.signature).toEqual(successObj.signature);
  });

  it('setComplete sets VegaTxStatus', () => {
    const { result } = setup();
    act(() => {
      result.current.setComplete();
    });
    expect(result.current.transaction.status).toBe(VegaTxStatus.Complete);
  });

  it('reset resets transaction status', async () => {
    const mockSendTx = jest.fn().mockReturnValue(
      Promise.resolve({
        transactionHash: '0x123',
        signature: 'signature',
      })
    );

    const { result } = setup({ sendTx: mockSendTx });

    await act(async () => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toBe(VegaTxStatus.Pending);

    act(() => {
      result.current.reset();
    });

    expect(result.current.transaction).toEqual(initialState);
  });
});
