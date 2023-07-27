import { useSearchParams } from 'react-router-dom';
import type { URLSearchParamsInit } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '@vegaprotocol/react-helpers';
import type {
  BlockExplorerTransactionResult,
  BlockExplorerTransactions,
} from '../routes/types/block-explorer-response';
import { DATA_SOURCES } from '../config';
import isNumber from 'lodash/isNumber';
import type { FilterOption } from '../components/txs/tx-filter';

export function getTypeFilters(filters?: Set<FilterOption>) {
  if (!filters) {
    return '';
  }

  const forcedSingleFilter = Array.from(filters)[0];
  return `filters[cmd.type]=${forcedSingleFilter}`;
}

interface IGetTxsDataUrl {
  count?: number;
  before?: string;
  after?: string;
  filters?: string;
  party?: string;
}
const BE_TXS_PER_REQUEST = 25;

export const getTxsDataUrl = ({
  count = BE_TXS_PER_REQUEST,
  before,
  after,
  filters,
  party,
}: IGetTxsDataUrl) => {
  if (before && after) {
    throw new Error('before and after cannot be used together');
  }

  const url = new URL(`${DATA_SOURCES.blockExplorerUrl}/transactions`);

  if (before) {
    url.searchParams.append('last', count.toString());
    url.searchParams.append('before', before);
  } else if (after) {
    url.searchParams.append('first', count.toString());
    url.searchParams.append('after', after);
  } else {
    url.searchParams.append('first', count.toString());
  }

  // Hacky fix for param as array
  let urlAsString = url.toString();
  if (filters) {
    urlAsString += '&' + filters.replace(' ', '%20');
  }
  if (party) {
    urlAsString += `&filters[tx.submitter]=${party}`;
  }

  return urlAsString;
};

export interface TxsStateProps {
  txsData: BlockExplorerTransactionResult[];
  hasMoreTxs: boolean;
  url: string;
}

export interface IUseTxsData {
  count?: number;
  before?: string;
  after?: string;
  party?: string;
  filters?: Set<FilterOption>;
}

export const useTxsData = ({
  count = 25,
  before,
  after,
  filters,
  party,
}: IUseTxsData) => {
  const [params, setSearchParams] = useSearchParams();

  const [{ txsData, hasMoreTxs, url }, setTxsState] = useState<TxsStateProps>({
    txsData: [],
    hasMoreTxs: false,
    url: getTxsDataUrl({
      filters: getTypeFilters(filters),
      count,
      before,
      after,
      party,
    }),
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
          hasMoreTxs: data.transactions.length === count,
          txsData: data.transactions,
        };
      });
    }
  }, [loading, data, count]);

  const nextPage = useCallback(() => {
    const after = data?.transactions.at(-1)?.cursor || '';
    const before = undefined;
    const params: URLSearchParamsInit = { after };
    if (filters) {
      params.filters = Array.from(filters).join(',');
    }
    setSearchParams(params);
    setTxsState((prev) => ({
      ...prev,
      url: getTxsDataUrl({
        party,
        count,
        after,
        before,
        filters: getTypeFilters(filters),
      }),
    }));
  }, [count, party, filters, data, setSearchParams]);

  const previousPage = useCallback(() => {
    const before = data?.transactions[0]?.cursor || '';
    const after = undefined;
    const params: URLSearchParamsInit = { before };
    if (filters && filters.size > 0 && filters.size === 1) {
      params.filters = Array.from(filters)[0];
    }
    setSearchParams(params);

    setTxsState((prev) => ({
      ...prev,
      url: getTxsDataUrl({
        party,
        count,
        after,
        before,
        filters: getTypeFilters(filters),
      }),
    }));
  }, [count, party, filters, data, setSearchParams]);

  const refreshTxs = useCallback(async () => {
    const before = undefined;
    const after = undefined;
    const params: URLSearchParamsInit = {};
    if (filters && filters.size > 0 && filters.size === 1) {
      params.filters = Array.from(filters)[0];
    }
    setSearchParams(params);

    setTxsState((prev) => ({
      ...prev,
      txsData: [],
      url: getTxsDataUrl({
        party,
        count,
        after,
        before,
        filters: getTypeFilters(filters),
      }),
    }));

    refetch({ count: BE_TXS_PER_REQUEST });
  }, [party, setTxsState, refetch, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = useCallback(
    (newFilters: Set<FilterOption>) => {
      setTxsState((prev) => ({
        ...prev,
        url: getTxsDataUrl({
          party,
          count,
          after,
          before,
          filters: getTypeFilters(newFilters),
        }),
      }));
    },
    [party, count, after, before]
  );

  return {
    updateFilters,
    txsData,
    loading,
    error,
    hasMoreTxs,
    refreshTxs,
    nextPage,
    previousPage,
  };
};
