import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useTransactionsStore } from '@/stores/transactions-store';

export const TransactionsIndex = () => {
  const { request } = useJsonRpcClient();
  const { loading, loadTransactions } = useTransactionsStore((state) => ({
    loading: state.loading,
    loadTransactions: state.loadTransactions,
  }));
  useEffect(() => {
    loadTransactions(request);
  }, [loadTransactions, request]);
  if (loading) return null;
  return <Outlet />;
};
