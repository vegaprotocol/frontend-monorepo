import { DATA_SOURCES } from '../../../config';
import { useCallback, useState } from 'react';
import { t, useFetch } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { RenderFetched } from '../../../components/render-fetched';
import { JumpToBlock } from '../../../components/jump-to-block';
import { TxsInfiniteList } from '../../../components/txs/txs-infinite-list';
import type { ChainExplorerTxResponse } from '../../types/chain-explorer-response';

interface TxsProps {
  latestBlockHeight: string;
  refresh: () => null;
}

interface TxsStateProps {
  areTxsLoading: boolean | undefined;
  txsError: Error | undefined;
  txsData: ChainExplorerTxResponse[];
  hasMoreTxs: boolean;
  nextPage: number;
}

const Txs = ({ latestBlockHeight }: TxsProps) => {
  const [
    { areTxsLoading, txsError, txsData, hasMoreTxs, nextPage },
    setTxsState,
  ] = useState<TxsStateProps>({
    areTxsLoading: false,
    txsError: undefined,
    txsData: [],
    hasMoreTxs: true,
    nextPage: 1,
  });

  const reusedBodyParams = {
    node_url: `${DATA_SOURCES.tendermintUrl}`,
    transaction_height: parseInt(latestBlockHeight),
    page_size: 50,
  };

  const {
    state: { error, loading },
    refetch,
  } = useFetch(
    `${DATA_SOURCES.chainExplorerUrl}`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...reusedBodyParams,
      }),
    },
    false
  );

  const loadTxs = useCallback(async () => {
    console.log(`loading, next page: ${nextPage}`);
    setTxsState((prev) => ({
      ...prev,
      areTxsLoading: loading,
    }));

    const data = await refetch({
      ...reusedBodyParams,
      page_number: nextPage,
    });

    if (data) {
      console.log(
        `finished loading, next page: ${nextPage}, txs items length of ${txsData.length}`
      );
      // @ts-ignore asdfasdfasdf
      const giveMeNumbers = data.map((x, index) => ({
        ...x,
        number: `page: ${nextPage}, item: ${index}`,
      }));

      setTxsState((prev) => ({
        ...prev,
        nextPage: prev.nextPage + 1,
        areTxsLoading: false,
        hasMoreTxs: true,
        txsData: [
          ...prev.txsData,
          ...(giveMeNumbers as ChainExplorerTxResponse[]),
        ],
      }));

      console.log(
        `finished setting state, next page: ${nextPage}, txs items length of ${txsData.length}`
      );
    }

    if (error) {
      setTxsState((prev) => ({
        ...prev,
        txsError: error,
      }));
    }
  }, [error, loading, nextPage, refetch, reusedBodyParams]);

  return (
    <section>
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <RenderFetched error={error} loading={loading}>
        <>
          <BlocksRefetch refetch={refetch} />
          <TxsInfiniteList
            hasMoreTxs={hasMoreTxs}
            areTxsLoading={areTxsLoading}
            txs={txsData}
            loadMoreTxs={loadTxs}
            error={txsError}
          />
        </>
      </RenderFetched>
      <JumpToBlock />
    </section>
  );
};

export { Txs };
