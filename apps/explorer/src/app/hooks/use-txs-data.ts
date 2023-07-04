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
  cursor: string;
  previousCursors: string[];
  hasPreviousPage: boolean;
}

export interface IUseTxsData {
  limit: number;
  filters?: string;
}

interface IGetTxsDataUrl {
  limit: string;
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
  const [
    { txsData, hasMoreTxs, cursor, previousCursors, hasPreviousPage },
    setTxsState,
  ] = useState<TxsStateProps>({
    txsData: [],
    hasMoreTxs: false,
    previousCursors: [],
    cursor: '',
    hasPreviousPage: false,
  });

  const url = getTxsDataUrl({ limit: limit.toString(), filters });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, true);

  useEffect(() => {
    if (!loading && data && isNumber(data.transactions.length)) {
      setTxsState((prev) => {
        return {
          ...prev,
          txsData: data.transactions,
          hasMoreTxs: data.transactions.length >= limit,
          cursor: data?.transactions.at(-1)?.cursor || '',
        };
      });
    }
  }, [loading, setTxsState, data, limit]);

  const nextPage = useCallback(() => {
    const c = data?.transactions.at(0)?.cursor;
    const newPreviousCursors = c ? [...previousCursors, c] : previousCursors;

    setTxsState((prev) => ({
      ...prev,
      hasPreviousPage: true,
      previousCursors: newPreviousCursors,
    }));

    return refetch({
      limit,
      before: cursor,
    });
  }, [data, previousCursors, cursor, limit, refetch]);

  const previousPage = useCallback(() => {
    const previousCursor = [...previousCursors].pop();
    const newPreviousCursors = previousCursors.slice(0, -1);
    setTxsState((prev) => ({
      ...prev,
      hasPreviousPage: newPreviousCursors.length > 0,
      previousCursors: newPreviousCursors,
    }));
    return refetch({
      limit,
      before: previousCursor,
    });
  }, [previousCursors, limit, refetch]);

  const refreshTxs = useCallback(async () => {
    setTxsState(() => ({
      txsData: [],
      cursor: '',
      previousCursors: [],
      hasMoreTxs: false,
      hasPreviousPage: false,
    }));

    refetch({ limit });
  }, [setTxsState, limit, refetch, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    txsData,
    loading,
    error,
    hasMoreTxs,
    hasPreviousPage,
    previousCursors,
    cursor,
    refreshTxs,
    nextPage,
    previousPage,
  };
};
