import { create } from 'zustand';

import type { SendMessage } from '@/contexts/json-rpc/json-rpc-provider';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { WALLET_NAME } from '@/lib/create-wallet';
import type { StoredTransaction } from '@/types/backend';

export type TransactionsStore = {
  transactions: StoredTransaction[];
  loading: boolean;
  loadTransactions: (request: SendMessage) => Promise<void>;
};

export const useTransactionsStore = create<TransactionsStore>()((set, get) => ({
  transactions: [],
  loading: true,
  async loadTransactions(request: SendMessage) {
    set({ loading: true });
    try {
      const transactions = await request(RpcMethods.ListTransactions, {
        wallet: WALLET_NAME,
      });
      const transactionsFlat = Object.values(transactions.transactions).flat(
        1
      ) as StoredTransaction[];
      set({ transactions: transactionsFlat });
    } finally {
      set({ loading: false });
    }
  },
}));
