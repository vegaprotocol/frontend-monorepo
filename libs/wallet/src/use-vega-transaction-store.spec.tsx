import { useVegaTransactionStore } from './use-vega-transaction-store';
import { VegaTxStatus } from './use-vega-transaction';
import type { VegaStoredTxState } from './use-vega-transaction-store';
import type {
  OrderCancellationBody,
  WithdrawSubmissionBody,
} from './connectors/vega-connector';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  determineId: jest.fn((v) => v),
}));

describe('useVegaTransactionStore', () => {
  const orderCancellation: OrderCancellationBody = { orderCancellation: {} };
  const withdrawSubmission: WithdrawSubmissionBody = {
    withdrawSubmission: {
      amount: 'amount',
      asset: 'asset',
      ext: {
        erc20: {
          receiverAddress: 'receiverAddress',
        },
      },
    },
  };
  const processedTransactionUpdate = {
    status: VegaTxStatus.Pending,
    txHash: 'txHash',
    signature: 'signature',
  };
  const transactionResult = {
    hash: processedTransactionUpdate.txHash,
  } as unknown as NonNullable<VegaStoredTxState['transactionResult']>;
  const withdrawal = {
    id: 'signature',
  } as unknown as NonNullable<VegaStoredTxState['withdrawal']>;
  const withdrawalApproval = {} as unknown as NonNullable<
    VegaStoredTxState['withdrawalApproval']
  >;
  it('creates transaction with default values', () => {
    useVegaTransactionStore.getState().create(orderCancellation);
    const transaction = useVegaTransactionStore.getState().transactions[0];
    expect(transaction?.createdAt).toBeTruthy();
    expect(transaction?.status).toEqual(VegaTxStatus.Requested);
    expect(transaction?.body).toEqual(orderCancellation);
    expect(transaction?.dialogOpen).toEqual(true);
  });
  it('updates transaction by index/id', () => {
    useVegaTransactionStore.getState().create(orderCancellation);
    useVegaTransactionStore.getState().create(orderCancellation);
    useVegaTransactionStore.getState().create(orderCancellation);
    const transaction = useVegaTransactionStore.getState().transactions[1];
    useVegaTransactionStore
      .getState()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .update(transaction!.id, { status: VegaTxStatus.Pending });
    expect(
      useVegaTransactionStore.getState().transactions.map((t) => t?.status)
    ).toEqual([
      VegaTxStatus.Requested,
      VegaTxStatus.Pending,
      VegaTxStatus.Requested,
    ]);
  });
  it('sets dialogOpen to false on dismiss', () => {
    useVegaTransactionStore.getState().create(orderCancellation);
    useVegaTransactionStore.getState().dismiss(0);
    expect(
      useVegaTransactionStore.getState().transactions[0]?.dialogOpen
    ).toEqual(false);
  });
  it('updates transaction result', () => {
    useVegaTransactionStore.getState().create(withdrawSubmission);
    useVegaTransactionStore.getState().update(0, processedTransactionUpdate);
    useVegaTransactionStore
      .getState()
      .updateTransactionResult(transactionResult);
    expect(
      useVegaTransactionStore.getState().transactions[0]?.transactionResult
    ).toEqual(transactionResult);
  });
  it('updates withdrawal', () => {
    useVegaTransactionStore.getState().create(withdrawSubmission);
    useVegaTransactionStore.getState().update(0, processedTransactionUpdate);
    useVegaTransactionStore
      .getState()
      .updateTransactionResult(transactionResult);
    useVegaTransactionStore
      .getState()
      .updateWithdrawal(withdrawal, withdrawalApproval);
    const transaction = useVegaTransactionStore.getState().transactions[0];
    expect(transaction?.withdrawalApproval).toEqual(withdrawalApproval);
    expect(transaction?.withdrawal).toEqual(withdrawal);
  });
});
