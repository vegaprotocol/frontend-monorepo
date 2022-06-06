import React from 'react';
import { useTransactionStore } from '../stores/transactions';

export const usePendingTransactions = () => {
  const { transactions } = useTransactionStore();

  return React.useMemo(() => {
    return transactions.some((tx) => tx.pending);
  }, [transactions]);
};
