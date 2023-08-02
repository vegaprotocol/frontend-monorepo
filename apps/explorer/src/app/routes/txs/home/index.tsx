import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../../components/route-title';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData, getInitialFilters } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';

import { useState } from 'react';
import { TxsFilter } from '../../../components/txs/tx-filter';
import type { FilterOption } from '../../../components/txs/tx-filter';
import { TxsListNavigation } from '../../../components/txs/tx-list-navigation';
import { useSearchParams } from 'react-router-dom';

export const TxsList = () => {
  useDocumentTitle(['Transactions']);

  return (
    <section className="md:p-2 lg:p-4 xl:p-6 relative">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <TxsListFiltered />
    </section>
  );
};

/**
 * Displays a list of transactions with filters and controls to navigate through the list.
 *
 * @returns {JSX.Element} Transaction List and controls
 */
export const TxsListFiltered = () => {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState(getInitialFilters(params));

  const {
    nextPage,
    previousPage,
    error,
    refreshTxs,
    loading,
    txsData,
    hasMoreTxs,
    updateFilters,
  } = useTxsData({
    filters: filters.size === 1 ? filters : undefined,
    before: params.get('before') || undefined,
    after: !params.get('before') ? params.get('after') || undefined : undefined,
  });

  return (
    <>
      <TxsListNavigation
        refreshTxs={refreshTxs}
        nextPage={nextPage}
        previousPage={previousPage}
        hasPreviousPage={true}
        loading={loading}
        hasMoreTxs={hasMoreTxs}
      >
        <TxsFilter
          filters={filters}
          setFilters={(f) => {
            setFilters(f);
            updateFilters(f as Set<FilterOption>);
          }}
        />
      </TxsListNavigation>
      <TxsInfiniteList
        hasFilters={filters.size > 0}
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={nextPage}
        error={error}
        className="mb-28 w-full min-w-[400px]"
      />
    </>
  );
};
