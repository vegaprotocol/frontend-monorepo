import { useEthWithdrawApprovalsStore } from './use-ethereum-withdraw-approvals-store';
import { type VegaStoredTxState } from './use-vega-transaction-store';
import {
  ApprovalStatus,
  type EthWithdrawalApprovalState,
} from './use-ethereum-withdraw-approvals-store';

const mockFindVegaTransaction = jest.fn<VegaStoredTxState, []>();
const mockDismissVegaTransaction = jest.fn();

jest.mock('./use-vega-transaction-store', () => ({
  useVegaTransactionStore: {
    getState: () => ({
      transactions: {
        find: mockFindVegaTransaction,
      },
      dismiss: mockDismissVegaTransaction,
    }),
  },
}));
describe('useEthWithdrawApprovalsStore', () => {
  const withdrawal = {} as unknown as EthWithdrawalApprovalState['withdrawal'];
  const approval = {} as unknown as NonNullable<
    EthWithdrawalApprovalState['approval']
  >;

  it('creates approval with default values, dismiss possible vega transaction', () => {
    const vegaTransaction = { id: 0 } as unknown as VegaStoredTxState;
    mockFindVegaTransaction.mockReturnValueOnce(vegaTransaction);
    useEthWithdrawApprovalsStore.getState().create(withdrawal, approval);
    const transaction = useEthWithdrawApprovalsStore.getState().transactions[0];
    expect(transaction?.createdAt).toBeTruthy();
    expect(transaction?.withdrawal).toBe(withdrawal);
    expect(transaction?.approval).toBe(approval);
    expect(transaction?.status).toEqual(ApprovalStatus.Idle);
    expect(transaction?.dialogOpen).toEqual(true);
    expect(mockDismissVegaTransaction).toBeCalledWith(vegaTransaction.id);
  });
  it('updates approval by index/id', () => {
    useEthWithdrawApprovalsStore.getState().create(withdrawal);
    useEthWithdrawApprovalsStore.getState().create(withdrawal);
    useEthWithdrawApprovalsStore.getState().create(withdrawal);
    useEthWithdrawApprovalsStore
      .getState()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .update(1, { status: ApprovalStatus.Pending });
    expect(
      useEthWithdrawApprovalsStore.getState().transactions.map((t) => t?.status)
    ).toEqual([
      ApprovalStatus.Idle,
      ApprovalStatus.Pending,
      ApprovalStatus.Idle,
    ]);
  });
  it('sets dialogOpen to false on dismiss', () => {
    const id = useEthWithdrawApprovalsStore.getState().create(withdrawal);
    useEthWithdrawApprovalsStore.getState().dismiss(id);
    expect(
      useEthWithdrawApprovalsStore.getState().transactions[id]?.dialogOpen
    ).toEqual(false);
  });
});
