import { act, renderHook } from '@testing-library/react';
import type { VegaWalletContextShape } from './context';
import { VegaWalletContext } from './context';
import type { ReactNode } from 'react';
import {
  initialState,
  useVegaTransaction,
  VegaTxStatus,
} from './use-vega-transaction';
import type { Transaction } from './connectors';
import { WalletError } from './connectors';

const mockPubKey = '0x123';

const defaultWalletContext: VegaWalletContextShape = {
  network: 'TESTNET',
  vegaUrl: 'https://vega.xyz',
  vegaWalletServiceUrl: 'https://vega.wallet.xyz',
  pubKey: null,
  pubKeys: [],
  isReadOnly: false,
  sendTx: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  links: {} as any,
};

function setup(context?: Partial<VegaWalletContextShape>) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <VegaWalletContext.Provider value={{ ...defaultWalletContext, ...context }}>
      {children}
    </VegaWalletContext.Provider>
  );
  return renderHook(() => useVegaTransaction(), { wrapper });
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
      Dialog: expect.any(Function),
    });
  });

  it('resets state if sendTx returns null (user rejects)', async () => {
    const mockSendTx = jest.fn().mockReturnValue(Promise.resolve(null));
    const { result } = setup({ sendTx: mockSendTx });
    await act(async () => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  });

  it('handles a single wallet error', () => {
    const error = new WalletError('test error', 1, 'test data');
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
    expect(result.current.transaction.error).toHaveProperty('code', 1);
    expect(result.current.transaction.error).toHaveProperty('data', error.data);
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
      'title',
      'Something went wrong'
    );
    expect(result.current.transaction.error).toHaveProperty('code', 105);
    expect(result.current.transaction.error).toHaveProperty(
      'message',
      'Unknown error occurred'
    );
    expect(result.current.transaction.error).toHaveProperty(
      'data',
      'Unknown error occurred'
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
