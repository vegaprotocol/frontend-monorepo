import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';

import { useState } from 'react';
import { AllFilterOptions, TxsFilter } from '../../../components/txs/tx-filter';

const BE_TXS_PER_REQUEST = 15;

export const TxsList = () => {
  useDocumentTitle(['Transactions']);

  return (
    <section className="md:p-2 lg:p-4 xl:p-6 relative">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <TxsListFiltered />
    </section>
  );
};

export const TxsListFiltered = () => {
  const [filters, setFilters] = useState(new Set(AllFilterOptions));

  const f =
    filters && filters.size === 1
      ? `filters[cmd.type]=${Array.from(filters)[0]}`
      : '';

  const { hasMoreTxs, loadTxs, error, txsData, refreshTxs, loading } =
    useTxsData({
      limit: BE_TXS_PER_REQUEST,
      filters: f,
    });

  return (
    <>
      <menu className="mb-2">
        <BlocksRefetch refetch={refreshTxs} />
        <TxsFilter filters={filters} setFilters={setFilters} />
      </menu>

      <TxsInfiniteList
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={loadTxs}
        error={error}
        className="mb-28"
      />
    </>
  );
};
