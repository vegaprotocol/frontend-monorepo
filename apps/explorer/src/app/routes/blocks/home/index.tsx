import { useState } from 'react';
import { DATA_SOURCES } from '../../../config';
import type {
  BlockMeta,
  TendermintBlockchainResponse,
} from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { RenderFetched } from '../../../components/render-fetched';
import { BlocksData, BlocksRefetch } from '../../../components/blocks';
import { BlocksInfiniteList } from '../../../components/blocks/blocks-infinite-list';
import { JumpToBlock } from '../../../components/jump-to-block';
import { t, useFetch } from '@vegaprotocol/react-helpers';

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
    state: { error: tmError, loading },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`,
    undefined,
    false
  );

  const loadBlocks = async () => {
    setAreBlocksLoading(loading);
    setError(tmError);

    const data = await refetch({
      maxHeight: Number(nextBlockHeightToLoad),
      minHeight: Math.max(Number(nextBlockHeightToLoad) - 21, 0),
    });

    if (data) {
      const blockMetas = data.result.block_metas;
      const lastBlockLoaded = parseInt(
        blockMetas[blockMetas.length - 1].header.height
      );

      setBlocksData([...blocksData, ...blockMetas]);
      setNextBlockHeightToLoad(lastBlockLoaded - 1);
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
