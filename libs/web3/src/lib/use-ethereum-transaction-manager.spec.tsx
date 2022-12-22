import { useEthTransactionManager } from './use-ethereum-transaction-manager';
import { renderHook } from '@testing-library/react';
import waitForNextTick from 'flush-promises';
import type { CollateralBridge } from '@vegaprotocol/smart-contracts';
import type {
  EthTransactionStore,
  EthStoredTxState,
} from './use-ethereum-transaction-store';
import type { WithdrawalBusEventFieldsFragment } from '@vegaprotocol/wallet';

import { EthTxStatus } from './use-ethereum-transaction';

const txHash = 'txHash';
const withdrawalId = 'withdrawalId';

const requestedTransactionUpdate = {
  status: EthTxStatus.Requested,
  error: null,
  confirmations: 0,
};

const mockDepositAsset = jest.fn();
const mockDepositAssetStatic = jest.fn();
const receipt = { confirmations: 5 };
const mockTxWait = jest.fn<{ confirmations: number } | undefined, never>(
  () => receipt
);
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
const createTransaction = (
  transaction?: Partial<EthStoredTxState>
): EthStoredTxState => ({
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
  ...transaction,
});

const mockTransactionStoreState = jest.fn<Partial<EthTransactionStore>, []>();

jest.mock('./use-ethereum-transaction-store', () => ({
  useEthTransactionStore: (
    selector: (state: Partial<EthTransactionStore>) => void
  ) => selector(mockTransactionStoreState()),
}));

const mockWriteFragment = jest.fn();

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ cache: { writeFragment: mockWriteFragment } }),
}));

describe('useVegaTransactionManager', () => {
  beforeEach(() => {
    mockTransactionStoreState.mockReset();
    update.mockClear();
    mockTxWait.mockClear();
    mockWriteFragment.mockClear();
  });

  it('sendTx of first pending transaction', async () => {
    mockTransactionStoreState.mockReturnValue({
      transactions: [createTransaction(), createTransaction({ id: 1 })],
      update,
    });
    const { rerender } = renderHook(useEthTransactionManager);
    await waitForNextTick();
    rerender();
    await waitForNextTick();
    expect(update.mock.calls[0]).toEqual([0, requestedTransactionUpdate]);
    expect(update.mock.calls[4]).toEqual([1, requestedTransactionUpdate]);
  });

  it('sets error if contract is undefined', async () => {
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [createTransaction({ contract: undefined })],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(
      update.mock.calls[update.mock.calls.length - 1][1].error
    ).toBeTruthy();
    expect(update.mock.calls[update.mock.calls.length - 1][1].status).toBe(
      EthTxStatus.Error
    );
  });
  it('sets error if contract static method do not exists', async () => {
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [
        createTransaction({
          contract: {
            ...contract,
            contract: {
              callStatic: {},
            },
          } as unknown as CollateralBridge,
        }),
      ],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(
      update.mock.calls[update.mock.calls.length - 1][1].error
    ).toBeTruthy();
    expect(update.mock.calls[update.mock.calls.length - 1][1].status).toBe(
      EthTxStatus.Error
    );
  });

  it('sets error if contract method do not exists', async () => {
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [
        createTransaction({
          contract: {
            ...contract,
            [methodName]: undefined,
          } as unknown as CollateralBridge,
        }),
      ],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(
      update.mock.calls[update.mock.calls.length - 1][1].error
    ).toBeTruthy();
    expect(update.mock.calls[update.mock.calls.length - 1][1].status).toBe(
      EthTxStatus.Error
    );
  });

  it('sets status to pending and updates tx hash', async () => {
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [
        createTransaction({
          withdrawal: { id: withdrawalId } as WithdrawalBusEventFieldsFragment,
        }),
      ],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(update.mock.calls[1][1]).toEqual({
      status: EthTxStatus.Pending,
      txHash,
    });
    expect(mockWriteFragment.mock.calls[0][0].id).toEqual(
      `Withdrawal:${withdrawalId}`
    );
    expect(mockWriteFragment.mock.calls[0][0].data).toEqual({
      __typename: 'Withdrawal',
      pendingOnForeignChain: true,
      txHash,
    });
  });

  it('sets status to error if no receipt', async () => {
    mockTxWait.mockReturnValueOnce(undefined);
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [
        createTransaction({
          withdrawal: { id: withdrawalId } as WithdrawalBusEventFieldsFragment,
        }),
      ],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(
      update.mock.calls[update.mock.calls.length - 1][1].error
    ).toBeTruthy();
    expect(update.mock.calls[update.mock.calls.length - 1][1].status).toBe(
      EthTxStatus.Error
    );
    expect(mockWriteFragment.mock.calls[1][0].data).toEqual({
      __typename: 'Withdrawal',
      pendingOnForeignChain: false,
      txHash,
    });
  });

  it('calls wait as many times as required confirmations', async () => {
    const requiredConfirmations = 3;
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [createTransaction({ requiredConfirmations })],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(mockTxWait).toBeCalledTimes(requiredConfirmations);
  });
  it('sets status to confirmed and updates receipt', async () => {
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [
        createTransaction({
          withdrawal: { id: withdrawalId } as WithdrawalBusEventFieldsFragment,
        }),
      ],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(update.mock.calls[3][1]).toEqual({
      status: EthTxStatus.Confirmed,
      receipt,
    });
    expect(mockWriteFragment.mock.calls[1][0].data).toEqual({
      __typename: 'Withdrawal',
      pendingOnForeignChain: false,
      txHash,
    });
  });

  it('sets status to complete if requires confirmation', async () => {
    mockTransactionStoreState.mockReturnValue({
      update,
      transactions: [createTransaction({ requiresConfirmation: true })],
    });
    renderHook(useEthTransactionManager);
    await waitForNextTick();
    expect(update.mock.calls[3][1]).toEqual({
      status: EthTxStatus.Complete,
      receipt,
    });
  });
});
