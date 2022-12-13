import { useEthTransactionManager } from './use-ethereum-transaction-manager';
import { renderHook } from '@testing-library/react';
import waitForNextTick from 'flush-promises';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type { EthTransactionStore } from './use-ethereum-transaction-store';

import { EthTxStatus } from './use-ethereum-transaction';

const txHash = 'txHash';

const requestedTransactionUpdate = {
  status: EthTxStatus.Requested,
  error: null,
  confirmations: 0,
};

const mockDepositAsset = jest.fn();
const mockDepositAssetStatic = jest.fn();
const mockTxWait = jest.fn(() => ({ confirmations: 5 }));
mockDepositAsset.mockResolvedValue({
  hash: txHash,
  wait: mockTxWait,
});

const contract = {
  contract: {
    callStatic: {
      deposit_asset: mockDepositAssetStatic,
    },
  },
  deposit_asset: mockDepositAsset,
} as unknown as CollateralBridge;
const methodName = 'deposit_asset';
const args: string[] = [];

const update = jest.fn();
const defaultState: Partial<EthTransactionStore> = {
  transactions: [
    {
      id: 0,
      status: EthTxStatus.Default,
      createdAt: new Date('2022-12-12T11:24:40.301Z'),
      updatedAt: new Date('2022-12-12T11:24:40.301Z'),
      contract,
      methodName,
      args,
      requiredConfirmations: 1,
      requiresConfirmation: false,
      error: null,
      confirmations: 0,
      dialogOpen: false,
      txHash: null,
      receipt: null,
    },
    {
      id: 1,
      status: EthTxStatus.Default,
      createdAt: new Date('2022-12-12T11:24:40.301Z'),
      updatedAt: new Date('2022-12-12T11:24:40.301Z'),
      contract,
      methodName,
      args,
      requiredConfirmations: 1,
      requiresConfirmation: false,
      error: null,
      confirmations: 0,
      dialogOpen: false,
      txHash: null,
      receipt: null,
    },
  ],
  update,
};

const mockTransactionStoreState = jest.fn<Partial<EthTransactionStore>, []>();

jest.mock('./use-ethereum-transaction-store', () => ({
  useEthTransactionStore: (
    selector: (state: Partial<EthTransactionStore>) => void
  ) => selector(mockTransactionStoreState()),
}));

describe('useVegaTransactionManager', () => {
  beforeEach(() => {
    update.mockReset();
    mockTransactionStoreState.mockReset();
  });

  it('sendTx of first pending transaction', async () => {
    mockTransactionStoreState.mockReturnValue(defaultState);
    const { rerender } = renderHook(useEthTransactionManager);
    await waitForNextTick();
    rerender();
    await waitForNextTick();
    expect(update.mock.calls[0]).toEqual([0, requestedTransactionUpdate]);
    expect(update.mock.calls[4]).toEqual([1, requestedTransactionUpdate]);
  });
});
