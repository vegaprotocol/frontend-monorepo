import { t } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList, TxsStatsInfo } from '../../../components/txs';
import { useTxsData } from '../../../hooks/use-txs-data';

const BE_TXS_PER_REQUEST = 100;

export const TxsList = () => {
  const { hasMoreTxs, loadTxs, error, txsData, refreshTxs, loading } =
    useTxsData({ limit: BE_TXS_PER_REQUEST });
  return (
    <section className="md:p-2 lg:p-4 xl:p-6">
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <BlocksRefetch refetch={refreshTxs} />
      <TxsStatsInfo className="!my-12 py-8" />
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
