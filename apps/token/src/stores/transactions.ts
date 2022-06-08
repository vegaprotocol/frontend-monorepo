import type ethers from 'ethers';
import type { GetState, SetState } from 'zustand';
import create from 'zustand';

export interface TxData {
  tx: ethers.ContractTransaction;
  receipt: ethers.ContractReceipt | null;
  pending: boolean;
  requiredConfirmations: number;
}

interface TransactionStore {
  transactions: Array<TxData>;
  add: (tx: TxData) => void;
  update: (tx: TxData) => void;
  remove: (tx: TxData) => void;
}

export const useTransactionStore = create(
  (set: SetState<TransactionStore>, get: GetState<TransactionStore>) => ({
    transactions: [],
    add: (tx) => {
      const { transactions } = get();
      set({ transactions: [...transactions, tx] });
    },
    update: (tx) => {
      const { transactions } = get();
      set({
        transactions: [
          ...transactions.filter((t) => t.tx.hash !== tx.tx.hash),
          tx,
        ],
      });
    },
    remove: (tx) => {
      const { transactions } = get();
      set({
        transactions: transactions.filter((t) => t.tx.hash !== tx.tx.hash),
      });
    },
  })
);
