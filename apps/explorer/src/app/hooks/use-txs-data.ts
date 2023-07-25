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
  url: string
}

export interface IUseTxsData {
  count?: number;
  before?: string;
  after?: string;
  filters?: string;
}

interface IGetTxsDataUrl {
  count?: number;
  before?: string;
  after?: string;
  filters?: string;
}
const BE_TXS_PER_REQUEST = 25;

export const getTxsDataUrl = ({ count = BE_TXS_PER_REQUEST, before, after, filters }: IGetTxsDataUrl) => {
  const url = new URL(`${DATA_SOURCES.blockExplorerUrl}/transactions`);

  if (before) {
    url.searchParams.append('last', count.toString());
    url.searchParams.append('before', before);
  }

  if (after) {
    url.searchParams.append('last', count.toString());
    url.searchParams.append('after', after);
  }

  // Hacky fix for param as array
  let urlAsString = url.toString();
  if (filters) {
    urlAsString += '&' + filters.replace(' ', '%20');
  }

  return urlAsString;
};

export const useTxsData = ({ count, before, after, filters }: IUseTxsData) => {
  const [
    { txsData, hasMoreTxs, url },
    setTxsState,
  ] = useState<TxsStateProps>({
    txsData: [],
    hasMoreTxs: false,
    url: getTxsDataUrl({ filters, count, before, after })
  });


  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, true);

  useEffect(() => {
    if (!loading && data && isNumber(data.transactions.length)) {
      setTxsState((prev) => {
        return {
          ...prev,
          txsData: data.transactions
        };
      });
    }
  }, [loading, setTxsState, data ]);

  const nextPage = useCallback(() => {
    return refetch({
      before: data?.transactions.at(-1)?.cursor || '',
    });
  }, [data, refetch]);

  const previousPage = useCallback(() => {
    return refetch({
      before: data?.transactions.at(0)?.cursor || '',
    });
  }, [data, refetch]);

  const refreshTxs = useCallback(async () => {
    setTxsState(() => ({
      txsData: [],
      previousCursors: [],
      hasMoreTxs: false,
      hasPreviousPage: false,
    }));

    refetch({ count: BE_TXS_PER_REQUEST });
  }, [setTxsState, refetch, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    txsData,
    loading,
    error,
    hasMoreTxs,
    refreshTxs,
    nextPage,
    previousPage,
  };
};
