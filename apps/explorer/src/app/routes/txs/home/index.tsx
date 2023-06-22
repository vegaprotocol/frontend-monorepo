import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';

import { useState } from 'react';
import { AllFilterOptions, TxsFilter } from '../../../components/txs/tx-filter';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';

const BE_TXS_PER_REQUEST = 25;

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
  const [filters, setFilters] = useState(new Set(AllFilterOptions));

  const f =
    filters && filters.size === 1
      ? `filters[cmd.type]=${Array.from(filters)[0]}`
      : '';

  const {
    hasMoreTxs,
    nextPage,
    previousPage,
    error,
    refreshTxs,
    loading,
    txsData,
    hasPreviousPage,
  } = useTxsData({
    limit: BE_TXS_PER_REQUEST,
    filters: f,
  });

  return (
    <>
      <menu className="mb-2 w-full ">
        <TxsFilter filters={filters} setFilters={setFilters} />
      </menu>
      <menu className="mb-2 w-full">
        <BlocksRefetch refetch={refreshTxs} />
        <div className="float-right">
          <Button
            className="mr-2"
            size="xs"
            disabled={!hasPreviousPage || loading}
            onClick={() => {
              previousPage();
            }}
          >
            Newer
          </Button>
          <Button
            size="xs"
            disabled={!hasMoreTxs || loading}
            onClick={() => {
              nextPage();
            }}
          >
            Older
          </Button>
        </div>
        <div className="float-right mr-2">
          {loading ? <Icon name="more" /> : null}
        </div>
      </menu>
      <TxsInfiniteList
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
