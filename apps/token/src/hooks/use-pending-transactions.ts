import React from 'react';

import { useContracts } from '../contexts/contracts/contracts-context';

export const usePendingTransactions = () => {
  const { transactions } = useContracts();

  return React.useMemo(() => {
    return transactions.some((tx) => tx.pending);
  }, [transactions]);
};
