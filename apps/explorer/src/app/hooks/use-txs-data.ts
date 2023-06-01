import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetch } from '@vegaprotocol/react-helpers';
import type {
  BlockExplorerTransactionResult,
  BlockExplorerTransactions,
} from '../routes/types/block-explorer-response';
import { DATA_SOURCES } from '../config';
import isNumber from 'lodash/isNumber';

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

  if (limit) {
    url.searchParams.append('limit', limit);
  }

  // Hacky fix for param as array
  let urlAsString = url.toString();
  if (filters) {
    urlAsString += '&' + filters.replace(' ', '%20');
  }

  return urlAsString;
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
    if (data && isNumber(data?.transactions?.length)) {
      setTxsState((prev) => ({
        txsData: [...prev.txsData, ...data.transactions],
        hasMoreTxs: data.transactions.length > 0,
        lastCursor:
          data.transactions[data.transactions.length - 1]?.cursor || '',
      }));
    }
  }, [setTxsState, data]);

  useMemo(() => {
    setTxsState((prev) => ({
      txsData: [],
      hasMoreTxs: true,
      lastCursor: '',
    }));
  }, [filters]);

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
