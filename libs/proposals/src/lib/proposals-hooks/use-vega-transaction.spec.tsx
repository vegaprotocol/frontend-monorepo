import { act, renderHook } from '@testing-library/react';
import {
  userRejectedError,
  type Transaction,
  ConnectorErrors,
  sendTransactionError,
} from '@vegaprotocol/wallet';
import {
  initialState,
  useVegaTransaction,
  VegaTxStatus,
} from './use-vega-transaction';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';
import { type ReactNode } from 'react';

const mockPubKey = '0x123';

function setup() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedWalletProvider>{children}</MockedWalletProvider>
  );
  return renderHook(() => useVegaTransaction(), { wrapper });
}

describe('useVegaTransaction', () => {
  const successObj = {
    transactionHash: '0x123',
    signature: 'signature',
  };

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
    jest
      .spyOn(mockConfig, 'sendTransaction')
      .mockRejectedValue(userRejectedError());
    const { result } = setup();
    await act(async () => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
  });

  it('handles a single error', () => {
    const error = sendTransactionError();
    jest.spyOn(mockConfig, 'sendTransaction').mockImplementation(() => {
      throw error;
    });
    const { result } = setup();
    act(() => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
    expect(result.current.transaction.error).toHaveProperty(
      'message',
      ConnectorErrors.sendTransaction.message
    );
  });

  it('handles an unknown error', () => {
    const unknownThrow = { foo: 'bar' };
    jest.spyOn(mockConfig, 'sendTransaction').mockImplementation(() => {
      throw unknownThrow;
    });
    const { result } = setup();
    act(() => {
      result.current.send(mockPubKey, {} as Transaction);
    });
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Error);
    expect(result.current.transaction.error).toHaveProperty(
      'message',
      ConnectorErrors.unknown.message
    );
  });

  it('sets txHash and signature to state if successful', async () => {
    jest
      .spyOn(mockConfig, 'sendTransaction')
      // @ts-ignore fields ommitted for brevity
      .mockResolvedValue(successObj);
    const { result } = setup();
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
    jest
      .spyOn(mockConfig, 'sendTransaction')
      // @ts-ignore fields ommitted for brevity
      .mockResolvedValue(successObj);

    const { result } = setup();

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
