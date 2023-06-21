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
  previousCursor: string;
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

function l(cursor: string | number, previousCursor: string | number, e = '') {
  console.group(`Cursor update: ${e}`);
  console.log(`Cursor: ${cursor}`);
  console.log(`Previous cursor: ${previousCursor}`);
  console.groupEnd();
}

export const useTxsData = ({ limit, filters }: IUseTxsData) => {
  const [{ txsData, hasMoreTxs, cursor, previousCursor }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: false,
      previousCursor: '',
      cursor: '',
    });

  const url = getTxsDataUrl({ limit: limit?.toString(), filters });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, true);

  useEffect(() => {
    if (data && isNumber(data?.transactions?.length)) {
      setTxsState((prev) => {
        return {
          ...prev,
          cursor: data.transactions.at(-1)?.cursor || '',
          txsData: data.transactions,
        };
      });
    }
  }, [cursor, setTxsState, data]);

  const nextPage = useCallback(() => {
    return refetch({
      limit,
      before: cursor,
    });
  }, [cursor, limit, refetch]);

  const previousPage = useCallback(() => {
    return refetch({
      limit,
      before: cursor,
    });
  }, [cursor, limit, refetch]);

  const refreshTxs = useCallback(async () => {
    setTxsState((prev) => ({
      cursor: '',
      previousCursor: '',
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
    previousCursor,
    cursor,
    refreshTxs,
    nextPage,
    previousPage,
  };
};
