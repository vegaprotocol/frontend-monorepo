import { DATA_SOURCES } from '../../../config';
import { useCallback, useEffect, useState } from 'react';
import { t, useFetch } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsInfiniteList } from '../../../components/txs';
import type {
  BlockExplorerTransaction,
  BlockExplorerTransactions,
} from '../../../routes/types/block-explorer-response';

interface TxsStateProps {
  txsData: BlockExplorerTransaction[];
  hasMoreTxs: boolean;
  lastCursor: string;
}

const BE_TXS_PER_REQUEST = 100;

export const TxsList = () => {
  const [{ txsData, hasMoreTxs, lastCursor }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: true,
      lastCursor: '',
    });

  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<BlockExplorerTransactions>(
    `${DATA_SOURCES.blockExplorerUrl}/transactions?` +
      new URLSearchParams({
        limit: BE_TXS_PER_REQUEST.toString(10),
      }),
    {},
    false
  );

  useEffect(() => {
    if (data?.transactions?.length) {
      setTxsState((prev) => ({
        txsData: [...prev.txsData, ...data.transactions],
        hasMoreTxs: true,
        lastCursor:
          data.transactions[data.transactions.length - 1].cursor || '',
      }));
    }
  }, [data?.transactions]);

  const loadTxs = useCallback(() => {
    return refetch({
      limit: BE_TXS_PER_REQUEST,
      before: lastCursor,
    });
  }, [lastCursor, refetch]);

  const refreshTxs = useCallback(async () => {
    setTxsState((prev) => ({
      ...prev,
      lastCursor: '',
      hasMoreTxs: true,
      txsData: [],
    }));
  }, [setTxsState]);

  return (
    <section>
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
