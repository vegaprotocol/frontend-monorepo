import { DATA_SOURCES } from '../../../config';
import { useCallback, useState, useMemo } from 'react';
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
  txsData: ChainExplorerTxResponse[];
  hasMoreTxs: boolean;
  nextPage: number;
}

const Txs = ({ latestBlockHeight }: TxsProps) => {
  console.log('rendered');
  const [{ txsData, hasMoreTxs, nextPage }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: true,
      nextPage: 1,
    });

  const reusedBodyParams = useMemo(
    () => ({
      node_url: `${DATA_SOURCES.tendermintUrl}`,
      transaction_height: parseInt(latestBlockHeight),
      page_size: 20,
    }),
    [latestBlockHeight]
  );

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
    }));

    const data = await refetch(undefined, {
      ...reusedBodyParams,
      page_number: nextPage,
    });

    if (data) {
      console.log(`finished loading, next page: ${nextPage}`);
      // @ts-ignore asdfasdfasdf
      const giveMeNumbers = data.map((x, index) => ({
        ...x,
        number: `page: ${nextPage}, item: ${index}`,
      }));

      setTxsState((prev) => ({
        ...prev,
        nextPage: prev.nextPage + 1,
        hasMoreTxs: true,
        txsData: [
          ...prev.txsData,
          ...(giveMeNumbers as ChainExplorerTxResponse[]),
        ],
      }));

      console.log(`finished setting state, next page: ${nextPage}`);
    }
  }, [nextPage, refetch, reusedBodyParams]);

  return (
    <section>
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <RenderFetched error={error} loading={false}>
        <>
          <BlocksRefetch refetch={refetch} />
          <TxsInfiniteList
            hasMoreTxs={hasMoreTxs}
            areTxsLoading={loading}
            txs={txsData}
            loadMoreTxs={loadTxs}
            error={error}
          />
        </>
      </RenderFetched>
      <JumpToBlock />
    </section>
  );
};

export { Txs };
