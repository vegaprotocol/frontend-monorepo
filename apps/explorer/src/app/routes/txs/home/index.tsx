import { t } from '@vegaprotocol/utils';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';
import { useDocumentTitle } from '../../../hooks/use-document-title';

const BE_TXS_PER_REQUEST = 20;

export const TxsList = () => {
  useDocumentTitle(['Transactions']);

  const { hasMoreTxs, loadTxs, error, txsData, refreshTxs, loading } =
    useTxsData({ limit: BE_TXS_PER_REQUEST });
  return (
    <section className="md:p-2 lg:p-4 xl:p-6">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <BlocksRefetch refetch={refreshTxs} />
      <TxsInfiniteList
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={loadTxs}
        error={error}
        className="mb-28"
      />
    </section>
  );
};
