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

interface IGetTxsDataUrl {
  limit?: string;
  filters?: string;
}

export const getTxsDataUrl = ({ limit, filters }: IGetTxsDataUrl) => {
  const url = new URL(`${DATA_SOURCES.blockExplorerUrl}/transactions`);
  let requiresAmpersand = false;

  if (limit) {
    url.searchParams.append('limit', limit);
    requiresAmpersand = true;
  }

  let value = url.toString();

  if (filters) {
    if (requiresAmpersand) {
      value += '&';
    }

    value += filters;
  }

  return value;
};

export const useTxsData = ({ limit, filters }: IUseTxsData) => {
  const [{ txsData, hasMoreTxs, lastCursor }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: true,
      lastCursor: '',
    });

  const url = getTxsDataUrl({ limit: limit?.toString(), filters });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, false);

  useEffect(() => {
    if (data?.transactions?.length) {
      setTxsState((prev) => ({
        txsData: [...prev.txsData, ...data.transactions],
        hasMoreTxs: false,
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
      hasMoreTxs: false,
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
