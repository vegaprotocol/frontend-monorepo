import { MockedProvider } from '@apollo/client/testing';
import { waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import type { VegaErc20Bridge } from '@vegaprotocol/smart-contracts-sdk';
import { EthereumError, TxState } from './use-ethereum-transaction';
import type { ReactNode } from 'react';
import { useEthereumTransaction } from './use-ethereum-transaction';
import type { ethers } from 'ethers';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

class MockContract {
  static txHash = 'tx-hash';
  confirmations = 0;
  depositAsset(args: any): Promise<ethers.ContractTransaction> {
    return Promise.resolve({
      hash: MockContract.txHash,
      wait: () => {
        this.confirmations++;
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                confirmations: this.confirmations,
              } as ethers.ContractReceipt),
            100
          );
        });
      },
    } as ethers.ContractTransaction);
  }
}

const mockContract = new MockContract();
const requiredConfirmations = 3;

function setup(perform: any) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider>{children}</MockedProvider>
  );
  return renderHook(
    // @ts-ignore force MockContract
    () => useEthereumTransaction(perform, requiredConfirmations),
    { wrapper }
  );
}

test('Ethereum transaction flow', async () => {
  const { result } = setup(() => {
    return mockContract.depositAsset({
      assetSource: 'asset-source',
      amount: '100',
      vegaPublicKey: 'vega-key',
    });
  });

  expect(result.current).toEqual({
    status: TxState.Default,
    txHash: null,
    error: null,
    confirmations: 0,
    perform: expect.any(Function),
  });

  act(() => {
    result.current.perform();
  });

  expect(result.current.status).toEqual(TxState.Requested);
  expect(result.current.confirmations).toBe(0);

  await waitFor(() => {
    expect(result.current.status).toEqual(TxState.Pending);
    expect(result.current.txHash).toEqual(MockContract.txHash);
  });

  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current.confirmations).toBe(1);
  expect(result.current.status).toEqual(TxState.Pending);

  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current.confirmations).toBe(2);
  expect(result.current.status).toEqual(TxState.Pending);

  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current.confirmations).toBe(3);

  // Now complete as required confirmations have been surpassed
  expect(result.current.status).toEqual(TxState.Complete);
});

test('Error handling', async () => {
  const { result } = setup(() => {
    throw { message: errorMsg, code: 500 };
  });

  const errorMsg = 'test-error';

  act(() => {
    result.current.perform();
  });

  expect(result.current.status).toEqual(TxState.Error);
  expect(result.current.error instanceof EthereumError).toBe(true);
  expect(result.current.error?.message).toBe(errorMsg);
});
