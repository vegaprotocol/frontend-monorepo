import produce from 'immer';
import type { Transaction } from './connectors';
import {
  isWithdrawTransaction,
  isOrderSubmissionTransaction,
  isOrderCancellationTransaction,
  isOrderAmendmentTransaction,
  isBatchMarketInstructionsTransaction,
} from './connectors';
import { determineId } from './utils';

import create from 'zustand';
import type { VegaTxState } from './use-vega-transaction';
import { VegaTxStatus } from './use-vega-transaction';
import type {
  TransactionEventFieldsFragment,
  WithdrawalBusEventFieldsFragment,
  OrderBusEventFieldsFragment,
} from './__generated__/TransactionResult';

import type { WithdrawalApprovalQuery } from './__generated__/WithdrawalApproval';
export interface VegaStoredTxState extends VegaTxState {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: Transaction;
  transactionResult?: TransactionEventFieldsFragment;
  withdrawal?: WithdrawalBusEventFieldsFragment;
  withdrawalApproval?: WithdrawalApprovalQuery['erc20WithdrawalApproval'];
  order?: OrderBusEventFieldsFragment;
}
export interface VegaTransactionStore {
  transactions: (VegaStoredTxState | undefined)[];
  create: (tx: Transaction) => number;
  update: (
    index: number,
    update: Partial<
      Pick<VegaStoredTxState, 'status' | 'txHash' | 'signature' | 'error'>
    >
  ) => void;
  dismiss: (index: number) => void;
  delete: (index: number) => void;
  updateWithdrawal: (
    withdrawal: NonNullable<VegaStoredTxState['withdrawal']>,
    withdrawalApproval: NonNullable<VegaStoredTxState['withdrawalApproval']>
  ) => void;
  updateOrder: (order: OrderBusEventFieldsFragment) => void;
  updateTransactionResult: (
    transactionResult: TransactionEventFieldsFragment
  ) => void;
}

export const useVegaTransactionStore = create<VegaTransactionStore>(
  (set, get) => ({
    transactions: [] as VegaStoredTxState[],
    create: (body: Transaction) => {
      const transactions = get().transactions;
      const now = new Date();
      const transaction: VegaStoredTxState = {
        id: transactions.length,
        createdAt: now,
        updatedAt: now,
        body,
        error: null,
        txHash: null,
        signature: null,
        status: VegaTxStatus.Requested,
        dialogOpen: true,
      };
      set({ transactions: transactions.concat(transaction) });
      return transaction.id;
    },
    update: (index: number, update: Partial<VegaStoredTxState>) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            Object.assign(transaction, update);
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
    dismiss: (index: number) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions[index];
          if (transaction) {
            transaction.dialogOpen = false;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
    delete: (index: number) => {
      set(
        produce((state: VegaTransactionStore) => {
          delete state.transactions[index];
        })
      );
    },
    updateWithdrawal: (
      withdrawal: NonNullable<VegaStoredTxState['withdrawal']>,
      withdrawalApproval: NonNullable<VegaStoredTxState['withdrawalApproval']>
    ) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction &&
              transaction.status === VegaTxStatus.Pending &&
              transaction.signature &&
              isWithdrawTransaction(transaction?.body) &&
              withdrawal.id === determineId(transaction.signature)
          );
          if (transaction) {
            transaction.withdrawal = withdrawal;
            transaction.withdrawalApproval = withdrawalApproval;
            transaction.status = VegaTxStatus.Complete;
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
    updateOrder: (order: OrderBusEventFieldsFragment) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find((transaction) => {
            if (!transaction || transaction.status !== VegaTxStatus.Pending) {
              return false;
            }
            if (
              isOrderSubmissionTransaction(transaction?.body) &&
              transaction.signature &&
              order.id === determineId(transaction.signature)
            ) {
              return true;
            }
            if (
              isOrderCancellationTransaction(transaction?.body) &&
              order.id === transaction.body.orderCancellation.orderId
            ) {
              return true;
            }
            if (
              isOrderAmendmentTransaction(transaction?.body) &&
              order.id === transaction.body.orderAmendment.orderId
            ) {
              return true;
            }
            if (
              isBatchMarketInstructionsTransaction(transaction?.body) &&
              transaction.signature &&
              order.id === determineId(transaction.signature)
            ) {
              return true;
            }
            return false;
          });
          if (transaction) {
            // TODO: handle multiple orders from batch market instructions
            // Note: If multiple orders are submitted the first order ID is determined by hashing the signature of the transaction
            // (see determineId function). For each subsequent order's ID, a hash of the previous orders ID is used
            transaction.order = order;
            transaction.status = VegaTxStatus.Complete;
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
    updateTransactionResult: (
      transactionResult: TransactionEventFieldsFragment
    ) => {
      set(
        produce((state: VegaTransactionStore) => {
          const transaction = state.transactions.find(
            (transaction) =>
              transaction?.txHash &&
              transaction.txHash.toLowerCase() ===
                transactionResult.hash.toLowerCase()
          );
          if (transaction) {
            transaction.transactionResult = transactionResult;
            if (
              isOrderCancellationTransaction(transaction.body) &&
              !transaction.body.orderCancellation.orderId &&
              !transactionResult.error &&
              transactionResult.status
            ) {
              transaction.status = VegaTxStatus.Complete;
            }
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
  })
);
