import { useSearchParams } from 'react-router-dom';
import { type URLSearchParamsInit } from 'react-router-dom';
import { useCallback } from 'react';
import { useFetch } from '@vegaprotocol/react-helpers';
import {
  type BlockExplorerTransactionResult,
  type BlockExplorerTransactions,
} from '../routes/types/block-explorer-response';
import isNumber from 'lodash/isNumber';
import { AllFilterOptions } from '../components/txs/tx-filter';
import { type FilterOption } from '../components/txs/tx-filter';
import { BE_TXS_PER_REQUEST, getTxsDataUrl } from './get-txs-data-url';

export function getTypeFilters(filters?: Set<FilterOption>) {
  if (!filters) {
    return '';
  } else if (filters.size > 1) {
    return '';
  }

  const forcedSingleFilter = Array.from(filters)[0];
  return `filters[cmd.type]=${forcedSingleFilter}`;
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
  const [, setSearchParams] = useSearchParams();
  let hasMoreTxs = true;
  let txsData: BlockExplorerTransactionResult[] = [];

  const url = getTxsDataUrl({
    filters: getTypeFilters(filters),
    count,
    before,
    after,
    party,
  });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(url, {}, true);

  if (!loading && data && isNumber(data.transactions.length)) {
    hasMoreTxs = data.transactions.length >= count;
    txsData = data.transactions;
  }

  const nextPage = useCallback(() => {
    const after = data?.transactions.at(-1)?.cursor || '';
    const params: URLSearchParamsInit = { after };
    if (filters) {
      params.filters = Array.from(filters).join(',');
    }
    setSearchParams(params);
  }, [filters, data, setSearchParams]);

  const previousPage = useCallback(() => {
    const before = data?.transactions[0]?.cursor || '';
    const params: URLSearchParamsInit = { before };
    if (filters && filters.size > 0 && filters.size === 1) {
      params.filters = Array.from(filters)[0];
    }
    setSearchParams(params);
  }, [filters, data, setSearchParams]);

  const refreshTxs = useCallback(async () => {
    const params: URLSearchParamsInit = {};
    if (filters && filters.size > 0 && filters.size === 1) {
      params.filters = Array.from(filters)[0];
    }
    setSearchParams(params);

    refetch({ count: BE_TXS_PER_REQUEST });
  }, [setSearchParams, refetch, filters]);

  const updateFilters = useCallback(
    (newFilters: Set<FilterOption>) => {
      const params: URLSearchParamsInit = {};
      if (newFilters && newFilters.size === 1) {
        params.filters = Array.from(newFilters)[0];
      }

      setSearchParams(params);
    },
    [setSearchParams]
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

/**
 * Returns a Set of filters based on the URLSearchParams, or
 * defaults to all.
 * @param params
 * @returns Set
 */
export function getInitialFilters(params: URLSearchParams): Set<FilterOption> {
  const defaultFilters = new Set(AllFilterOptions);

  const p = params.get('filters');

  if (!p) {
    return defaultFilters;
  }

  const filters = new Set<FilterOption>();
  p.split(',').forEach((f) => {
    if (AllFilterOptions.includes(f as FilterOption)) {
      filters.add(f as FilterOption);
    }
  });

  if (filters.size === 0) {
    return defaultFilters;
  }

  return filters;
}
