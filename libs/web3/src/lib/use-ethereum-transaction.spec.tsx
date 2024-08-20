import { renderHook, act } from '@testing-library/react';
import { EthTxStatus } from './use-ethereum-transaction';
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
  contract = {
    callStatic: {
      depositAsset() {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 10);
        });
      },
    },
  } as unknown as ethers.Contract;

  depositAsset(assetSource: string, amount: string, vegaPublicKey: string) {
    return Promise.resolve({
      hash: MockContract.txHash,
      wait: () => {
        confirmations++;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              from: 'foo',
              confirmations,
            } as ethers.ContractReceipt);
          }, 100);
        });
      },
    } as ethers.ContractTransaction);
  }
}

let confirmations = 0;
const mockContract = new MockContract();
const requiredConfirmations = 3;

function setup(methodName: 'depositAsset' = 'depositAsset') {
  return renderHook(() =>
    useEthereumTransaction<MockContract, 'depositAsset'>(
      mockContract,
      methodName,
      requiredConfirmations
    )
  );
}

it('Ethereum transaction flow', async () => {
  const { result } = setup();

  expect(result.current).toEqual({
    transaction: {
      status: EthTxStatus.Default,
      txHash: null,
      error: null,
      confirmations: 0,
      receipt: null,
      dialogOpen: false,
    },
    Dialog: expect.any(Function),
    TxContent: expect.any(Object),
    setConfirmed: expect.any(Function),
    perform: expect.any(Function),
    reset: expect.any(Function),
  });

  act(() => {
    result.current.perform('asset-source', '100', 'vega-key');
  });

  expect(result.current.transaction.status).toEqual(EthTxStatus.Requested); // still default as we await result of static call
  expect(result.current.transaction.confirmations).toBe(0);

  await act(async () => {
    jest.advanceTimersByTime(10);
  });

  expect(result.current.transaction.status).toEqual(EthTxStatus.Pending);
  expect(result.current.transaction.txHash).toEqual(MockContract.txHash);
  expect(result.current.transaction.confirmations).toBe(0);

  await act(async () => {
    jest.advanceTimersByTime(100);
  });

  expect(result.current.transaction.confirmations).toBe(1);
  expect(result.current.transaction.status).toEqual(EthTxStatus.Pending);

  await act(async () => {
    jest.advanceTimersByTime(100);
  });

  expect(result.current.transaction.confirmations).toBe(2);
  expect(result.current.transaction.status).toEqual(EthTxStatus.Pending);

  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current.transaction.confirmations).toBe(3);

  // Now complete as required confirmations have been surpassed
  expect(result.current.transaction.status).toEqual(EthTxStatus.Confirmed);
  expect(result.current.transaction.receipt).toEqual({
    from: 'foo',
    confirmations: result.current.transaction.confirmations,
  });
});

describe('error handling', () => {
  it('ensures correct method is used', async () => {
    const { result } = setup('non-existing-method' as 'depositAsset');

    act(() => {
      result.current.perform('asset-rouce', '100', 'vega-key');
    });

    expect(result.current.transaction.status).toEqual(EthTxStatus.Error);
  });
});
