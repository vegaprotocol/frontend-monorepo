import { useCallback, useEffect, useState } from 'react';
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
  firstCursor: string;
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
  const [{ txsData, hasMoreTxs, lastCursor, firstCursor }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: false,
      lastCursor: '',
      firstCursor: '',
    });

  const url = getTxsDataUrl({ limit: limit?.toString(), filters });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, true);

  useEffect(() => {
    if (data && isNumber(data?.transactions?.length)) {
      setTxsState((prev) => ({
        txsData: data.transactions,
        hasMoreTxs: data.transactions.length > 0,
        firstCursor: prev.firstCursor,
        lastCursor:
          data.transactions[data.transactions.length - 1]?.cursor || '',
      }));
    }
  }, [setTxsState, data]);

  useEffect(() => {
    setTxsState((prev) => ({
      txsData: [],
      hasMoreTxs: false,
      lastCursor: '',
      firstCursor: '',
    }));
  }, [filters, limit, refetch]);

  const nextPage = useCallback(() => {
    return refetch({
      limit,
      before: lastCursor,
    });
  }, [lastCursor, limit, refetch]);

  const previousPage = useCallback(() => {
    setTxsState((prev) => ({
      txsData: prev.txsData,
      hasMoreTxs: prev.hasMoreTxs,
      firstCursor: prev.txsData[0].cursor,
      lastCursor: prev.lastCursor,
    }));

    return refetch({
      limit,
      before: firstCursor,
    });
  }, [firstCursor, limit, refetch]);

  const refreshTxs = useCallback(async () => {
    setTxsState((prev) => ({
      lastCursor: '',
      firstCursor: '',
      hasMoreTxs: false,
      txsData: [],
    }));

    refetch({ limit });
  }, [setTxsState, limit, refetch]);

  return {
    data,
    loading,
    error,
    txsData,
    hasMoreTxs,
    firstCursor,
    lastCursor,
    refreshTxs,
    nextPage,
    previousPage,
  };
};
