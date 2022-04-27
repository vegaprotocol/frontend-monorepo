import { useEffect, useState } from 'react';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import type {
  BlockMeta,
  TendermintBlockchainResponse,
} from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { RenderFetched } from '../../../components/render-fetched';
import { BlocksData, BlocksRefetch } from '../../../components/blocks';
import { BlocksInfiniteList } from '../../../components/blocks/blocks-infinite-list';
import { JumpToBlock } from '../../../components/jump-to-block';
import { t } from '@vegaprotocol/react-helpers';

const Blocks = () => {
  const [hasMoreBlocks, setHasMoreBlocks] = useState(true);
  const [areBlocksLoading, setAreBlocksLoading] = useState<boolean | undefined>(
    false
  );
  const [error, setError] = useState<Error | undefined>(undefined);
  const [blocksData, setBlocksData] = useState<BlockMeta[]>([]);
  const [nextBlockHeightToLoad, setNextBlockHeightToLoad] = useState<
    number | undefined
  >(undefined);
  const {
    state: { data, error: tmError, loading },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    // Inclusive not exclusive subtract 1 somewhere
    `${DATA_SOURCES.tendermintUrl}/blockchain${
      nextBlockHeightToLoad
        ? `?maxHeight=${Number(nextBlockHeightToLoad) - 1}&minHeight=${Math.max(
            Number(nextBlockHeightToLoad) - 21,
            0
          )}`
        : ''
    }`,
    undefined,
    false
  );
  console.log(data);

  const loadBlocks = async (...args: any[]) => {
    setAreBlocksLoading(loading);
    setError(error);
    const data = await refetch();

    if (data) {
      const blockMetas = data.result.block_metas;
      const lastBlockLoaded = parseInt(
        blockMetas[blockMetas.length - 1].header.height
      );

      setBlocksData([...blocksData, ...blockMetas]);
      setNextBlockHeightToLoad(lastBlockLoaded);
      setHasMoreBlocks(lastBlockLoaded > 0);
    }
  };

  return (
    <section>
      <RouteTitle>{t('Blocks')}</RouteTitle>
      {/*<RenderFetched error={error} loading={loading}>*/}
      {/*  <>*/}
      {/*    <BlocksRefetch refetch={refetch} />*/}
      {/*    <BlocksData data={data} className="mb-28" />*/}
      {/*  </>*/}
      {/*</RenderFetched>*/}

      <BlocksInfiniteList
        hasMoreBlocks={hasMoreBlocks}
        areBlocksLoading={areBlocksLoading}
        items={blocksData}
        loadMoreBlocks={loadBlocks}
        error={error}
      />
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
