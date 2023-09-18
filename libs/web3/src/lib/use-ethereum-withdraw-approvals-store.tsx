import { create } from 'zustand';
import produce from 'immer';
import type BigNumber from 'bignumber.js';
import type { WithdrawalBusEventFieldsFragment } from './__generated__/TransactionResult';
import { useVegaTransactionStore } from './use-vega-transaction-store';

import type { WithdrawalApprovalQuery } from './__generated__/WithdrawalApproval';
import { subscribeWithSelector } from 'zustand/middleware';

export enum ApprovalStatus {
  Idle = 'Idle',
  Pending = 'Pending',
  Delayed = 'Delayed',
  Error = 'Error',
  Ready = 'Ready',
}

export enum WithdrawalFailure {
  InvalidAsset,
  NoConnection,
  WrongConnection,
}

export interface EthWithdrawalApprovalState {
  id: number;
  createdAt: Date;
  status: ApprovalStatus;
  message?: string; //#TODO message is not use anywhere
  threshold?: BigNumber;
  completeTimestamp?: number | null;
  dialogOpen?: boolean;
  withdrawal: WithdrawalBusEventFieldsFragment;
  approval?: WithdrawalApprovalQuery['erc20WithdrawalApproval'];
  failureReason?: WithdrawalFailure;
}
export interface EthWithdrawApprovalStore {
  transactions: (EthWithdrawalApprovalState | undefined)[];
  create: (
    withdrawal: EthWithdrawalApprovalState['withdrawal'],
    approval?: EthWithdrawalApprovalState['approval']
  ) => number;
  update: (
    id: EthWithdrawalApprovalState['id'],
    update?: Partial<
      Pick<
        EthWithdrawalApprovalState,
        | 'approval'
        | 'status'
        | 'message'
        | 'threshold'
        | 'completeTimestamp'
        | 'dialogOpen'
        | 'failureReason'
      >
    >
  ) => void;
  dismiss: (index: number) => void;
  delete: (index: number) => void;
}

export const useEthWithdrawApprovalsStore = create<EthWithdrawApprovalStore>()(
  subscribeWithSelector((set, get) => ({
    transactions: [] as EthWithdrawalApprovalState[],
    create: (
      withdrawal: EthWithdrawalApprovalState['withdrawal'],
      approval?: EthWithdrawalApprovalState['approval']
    ) => {
      const transactions = get().transactions;
      const transaction: EthWithdrawalApprovalState = {
        id: transactions.length,
        createdAt: new Date(),
        status: ApprovalStatus.Idle,
        withdrawal,
        approval,
        dialogOpen: true,
      };
      // dismiss possible vega transaction dialog/toast
      const vegaTransaction = useVegaTransactionStore
        .getState()
        .transactions.find((t) => t?.withdrawal?.id === withdrawal.id);
      if (vegaTransaction) {
        useVegaTransactionStore.getState().dismiss(vegaTransaction.id);
      }
      set({ transactions: transactions.concat(transaction) });
      return transaction.id;
    },
    update: (
      id: EthWithdrawalApprovalState['id'],
      update?: Partial<
        Pick<
          EthWithdrawalApprovalState,
          | 'approval'
          | 'status'
          | 'message'
          | 'threshold'
          | 'completeTimestamp'
          | 'dialogOpen'
          | 'failureReason'
        >
      >
    ) =>
      set({
        transactions: produce(get().transactions, (draft) => {
          const transaction = draft.find(
            (transaction) => transaction?.id === id
          );
          if (transaction) {
            Object.assign(transaction, update);
          }
        }),
      }),
    dismiss: (index: number) => {
      set(
        produce((state: EthWithdrawApprovalStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            transaction.dialogOpen = false;
          }
        })
      );
    },
    delete: (index: number) => {
      set(
        produce((state: EthWithdrawApprovalStore) => {
          delete state.transactions[index];
        })
      );
    },
  }))
);
