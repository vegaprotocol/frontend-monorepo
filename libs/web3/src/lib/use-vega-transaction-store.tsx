import produce from 'immer';
import type { Transaction } from '@vegaprotocol/wallet';
import {
  isWithdrawTransaction,
  isOrderSubmissionTransaction,
  isOrderCancellationTransaction,
  isOrderAmendmentTransaction,
  isBatchMarketInstructionsTransaction,
  isTransferTransaction,
  isStopOrdersSubmissionTransaction,
  isStopOrdersCancellationTransaction,
  determineId,
  isMarginModeUpdateTransaction,
} from '@vegaprotocol/wallet';

import { create } from 'zustand';
import type {
  TransactionEventFieldsFragment,
  WithdrawalBusEventFieldsFragment,
  OrderTxUpdateFieldsFragment,
} from './__generated__/TransactionResult';

import type { WithdrawalApprovalQuery } from './__generated__/WithdrawalApproval';
import { subscribeWithSelector } from 'zustand/middleware';
import type { VegaTxState } from './types';
import { VegaTxStatus } from './types';

export interface VegaStoredTxState extends VegaTxState {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: Transaction;
  transactionResult?: TransactionEventFieldsFragment;
  withdrawal?: WithdrawalBusEventFieldsFragment;
  withdrawalApproval?: WithdrawalApprovalQuery['erc20WithdrawalApproval'];
  order?: OrderTxUpdateFieldsFragment;
}

export interface VegaTransactionStore {
  transactions: (VegaStoredTxState | undefined)[];
  create: (tx: Transaction, order?: OrderTxUpdateFieldsFragment) => number;
  update: (
    index: number,
    update: Partial<
      Pick<VegaStoredTxState, 'status' | 'txHash' | 'signature' | 'error'>
    >
  ) => void;
  dismiss: (index: number) => void;
  delete: (index: number) => void;
  getTransaction: (txHash: string) => VegaStoredTxState | undefined;
  updateWithdrawal: (
    withdrawal: NonNullable<VegaStoredTxState['withdrawal']>,
    withdrawalApproval: NonNullable<VegaStoredTxState['withdrawalApproval']>
  ) => void;
  updateOrder: (order: OrderTxUpdateFieldsFragment) => void;
  updateTransactionResult: (
    transactionResult: TransactionEventFieldsFragment
  ) => void;
}

export const useVegaTransactionStore = create<VegaTransactionStore>()(
  subscribeWithSelector((set, get) => ({
    transactions: [] as (VegaStoredTxState | undefined)[],
    getTransaction: (txHash: string) => {
      return get().transactions.find(
        (transaction) =>
          transaction?.txHash && transaction.txHash.toLowerCase() === txHash
      );
    },
    create: (body: Transaction, order?: OrderTxUpdateFieldsFragment) => {
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
        order,
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
    updateOrder: (order) => {
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
            transaction.order =
              isOrderAmendmentTransaction(transaction?.body) &&
              transaction.order
                ? transaction.order // the transaction.order would be the original order amended
                : order;
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
            if (transactionResult.error) {
              transaction.status = VegaTxStatus.Error;
              transaction.error = new Error(transactionResult.error);
            } else {
              const isConfirmedOrderCancellation =
                isOrderCancellationTransaction(transaction.body) &&
                !transaction.body.orderCancellation.orderId;
              const isConfirmedTransfer = isTransferTransaction(
                transaction.body
              );
              const isConfirmedStopOrderCancellation =
                isStopOrdersCancellationTransaction(transaction.body);
              const isConfirmedStopOrderSubmission =
                isStopOrdersSubmissionTransaction(transaction.body);
              const isConfirmedMarginModeTransaction =
                isMarginModeUpdateTransaction(transaction.body);

              if (
                (isConfirmedOrderCancellation ||
                  isConfirmedTransfer ||
                  isConfirmedStopOrderCancellation ||
                  isConfirmedStopOrderSubmission ||
                  isConfirmedMarginModeTransaction) &&
                transactionResult.status
              ) {
                transaction.status = VegaTxStatus.Complete;
              }
            }
            transaction.dialogOpen = true;
            transaction.updatedAt = new Date();
          }
        })
      );
    },
  }))
);
