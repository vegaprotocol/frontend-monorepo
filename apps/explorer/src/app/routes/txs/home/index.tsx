import { DATA_SOURCES } from '../../../config';
import { useCallback, useState, useMemo } from 'react';
import { t, useFetch } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { JumpToBlock } from '../../../components/jump-to-block';
import { TxsInfiniteList } from '../../../components/txs';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { ChainExplorerTxResponse } from '../../types/chain-explorer-response';
import type { TendermintBlockchainResponse } from '../../blocks/tendermint-blockchain-response';

interface TxsProps {
  latestBlockHeight: string;
}

interface TxsStateProps {
  txsData: ChainExplorerTxResponse[];
  hasMoreTxs: boolean;
  nextPage: number;
}

const Txs = ({ latestBlockHeight }: TxsProps) => {
  const [{ txsData, hasMoreTxs, nextPage }, setTxsState] =
    useState<TxsStateProps>({
      txsData: [],
      hasMoreTxs: true,
      nextPage: 1,
    });

  const reusedBodyParams = useMemo(
    () => ({
      node_url: DATA_SOURCES.tendermintUrl,
      transaction_height: parseInt(latestBlockHeight),
      page_size: 30,
    }),
    [latestBlockHeight]
  );

  const {
    state: { error, loading },
    refetch,
  } = useFetch(
    DATA_SOURCES.chainExplorerUrl,
    {
      method: 'POST',
      body: JSON.stringify(reusedBodyParams),
    },
    false
  );

  const loadTxs = useCallback(async () => {
    const data = await refetch(
      undefined,
      JSON.stringify({
        ...reusedBodyParams,
        page_number: nextPage,
      })
    );

    if (data) {
      setTxsState((prev) => ({
        ...prev,
        nextPage: prev.nextPage + 1,
        hasMoreTxs: true,
        txsData: [...prev.txsData, ...(data as ChainExplorerTxResponse[])],
      }));
    }
  }, [nextPage, refetch, reusedBodyParams]);

  return (
    <section>
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <BlocksRefetch
        refetch={() =>
          refetch(
            undefined,
            JSON.stringify({
              ...reusedBodyParams,
              page_number: 1,
            })
          )
        }
      />
      <TxsInfiniteList
        hasMoreTxs={hasMoreTxs}
        areTxsLoading={loading}
        txs={txsData}
        loadMoreTxs={loadTxs}
        error={error}
        className="mb-28"
      />
      <JumpToBlock />
    </section>
  );
};

const Wrapper = () => {
  const {
    state: { data, error, loading },
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  return (
    <AsyncRenderer
      loading={!!loading}
      loadingMessage={t('Getting latest block height...')}
      error={error}
      data={data}
      noDataMessage={t('Could not get latest block height')}
      render={(data) => (
        <Txs
          latestBlockHeight={
            data?.result?.block_metas?.[0]?.header?.height || ''
          }
        />
      )}
    />
  );
};

export { Wrapper as TxsHome };
