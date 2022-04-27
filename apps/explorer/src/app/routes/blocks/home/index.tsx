import { useState } from 'react';
import { DATA_SOURCES } from '../../../config';
import type {
  BlockMeta,
  TendermintBlockchainResponse,
} from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { BlocksInfiniteList } from '../../../components/blocks/blocks-infinite-list';
import { JumpToBlock } from '../../../components/jump-to-block';
import { t, useFetch } from '@vegaprotocol/react-helpers';

// This constant should only be changed if Tendermint API changes the max blocks returned
const TM_BLOCKS_PER_REQUEST = 20;

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
  const [lastBlockHeightLoaded, setLastBlockHeightLoaded] = useState<number>();

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

    const maxHeight = Math.max(
      Number(nextBlockHeightToLoad),
      TM_BLOCKS_PER_REQUEST
    );

    const minHeight =
      Number(nextBlockHeightToLoad) - TM_BLOCKS_PER_REQUEST > 1
        ? Number(nextBlockHeightToLoad) - TM_BLOCKS_PER_REQUEST
        : undefined;

    const data = await refetch({
      maxHeight,
      minHeight,
    });

    if (data) {
      const blockMetas = data.result.block_metas;
      setLastBlockHeightLoaded(
        parseInt(blockMetas[blockMetas.length - 1].header.height)
      );

      if (lastBlockHeightLoaded) {
        setNextBlockHeightToLoad(lastBlockHeightLoaded - 1);
        setHasMoreBlocks(lastBlockHeightLoaded > 1);
      }

      setBlocksData([...blocksData, ...blockMetas]);
    }
  };

  return (
    <section>
      <RouteTitle>{t('Blocks')}</RouteTitle>
      <BlocksRefetch refetch={refetch} />
      <BlocksInfiniteList
        hasMoreBlocks={hasMoreBlocks}
        areBlocksLoading={areBlocksLoading}
        blocks={blocksData}
        loadMoreBlocks={loadBlocks}
        error={error}
        className="pb-16"
      />
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
