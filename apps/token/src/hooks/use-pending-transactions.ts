import React from "react";

import { useContracts } from "../contexts/contracts/contracts-context";

export const usePendingTransactions = () => {
  const { transactions } = useContracts();

  const pending = React.useMemo(() => {
    return transactions.some((tx) => tx.pending);
  }, [transactions]);

  return pending;
};
