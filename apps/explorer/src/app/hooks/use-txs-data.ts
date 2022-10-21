import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '@vegaprotocol/react-helpers';
import type {
  BlockExplorerTransactionResult,
  BlockExplorerTransactions,
} from '../routes/types/block-explorer-response';
import { DATA_SOURCES } from '../config';

export interface TxsStateProps {
  txsData: BlockExplorerTransactionResult[];
  hasMoreTxs: boolean;
  lastCursor: string;
}

export interface IUseTxsData {
  limit?: number;
  filters?: string;
}

export const getTxsDataUrl = ({ limit = 10, filters = '' }) => {
  let url = `${DATA_SOURCES.blockExplorerUrl}/transactions?limit=${limit}`;

  if (filters) {
    url = `${url}&${filters}`;
  }

  return url;
};

export const useTxsData = ({ limit = 10, filters }: IUseTxsData) => {
  const [{ txsData, hasMoreTxs, lastCursor }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: true,
      lastCursor: '',
    });

  const url = getTxsDataUrl({ limit, filters });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, false);

  useEffect(() => {
    if (data?.transactions?.length) {
      setTxsState((prev) => ({
        txsData: [...prev.txsData, ...data.transactions],
        hasMoreTxs: true,
        lastCursor:
          data.transactions[data.transactions.length - 1].cursor || '',
      }));
    }
  }, [setTxsState, data?.transactions]);

  const loadTxs = useCallback(() => {
    return refetch({
      limit: limit,
      before: lastCursor,
    });
  }, [lastCursor, limit, refetch]);

  const refreshTxs = useCallback(async () => {
    setTxsState((prev) => ({
      ...prev,
      lastCursor: '',
      hasMoreTxs: true,
      txsData: [],
    }));
  }, [setTxsState]);

  return {
    data,
    loading,
    error,
    txsData,
    hasMoreTxs,
    lastCursor,
    refreshTxs,
    loadTxs,
  };
};
