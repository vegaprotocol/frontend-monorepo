import { useCallback, useState } from 'react';
import { DATA_SOURCES } from '../../../config';
import {
  type BlockMeta,
  type TendermintBlockchainResponse,
} from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { BlocksInfiniteList } from '../../../components/blocks/blocks-infinite-list';
import { JumpToBlock } from '../../../components/jump-to-block';
import { t } from '@vegaprotocol/i18n';
import { useFetch } from '@vegaprotocol/react-helpers';
import { useDocumentTitle } from '../../../hooks/use-document-title';

// This constant should only be changed if Tendermint API changes the max blocks returned
const TM_BLOCKS_PER_REQUEST = 20;

interface BlocksStateProps {
  areBlocksLoading: boolean | undefined;
  blocksError: Error | undefined;
  blocksData: BlockMeta[];
  hasMoreBlocks: boolean;
  nextBlockHeightToLoad: number | undefined;
}

const Blocks = () => {
  useDocumentTitle(['Blocks']);
  const [
    {
      areBlocksLoading,
      blocksError,
      blocksData,
      hasMoreBlocks,
      nextBlockHeightToLoad,
    },
    setBlocksState,
  ] = useState<BlocksStateProps>({
    areBlocksLoading: false,
    blocksError: undefined,
    blocksData: [],
    hasMoreBlocks: true,
    nextBlockHeightToLoad: undefined,
  });

  const {
    state: { error, loading },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`,
    { cache: 'no-cache' },
    false
  );

  const loadBlocks = useCallback(async () => {
    setBlocksState((prev) => ({
      ...prev,
      areBlocksLoading: loading,
    }));

    const maxHeight = Math.max(
      Number(nextBlockHeightToLoad),
      TM_BLOCKS_PER_REQUEST
    );

    const minHeight =
      Number(nextBlockHeightToLoad) - TM_BLOCKS_PER_REQUEST > 1
        ? Number(nextBlockHeightToLoad) - TM_BLOCKS_PER_REQUEST - 1
        : undefined;

    const data = await refetch({
      maxHeight,
      minHeight,
    });

    if (data) {
      const blockMetas = data.result.block_metas;
      const lastBlockHeightLoaded =
        blockMetas && blockMetas.length > 0
          ? parseInt(blockMetas[blockMetas.length - 1].header.height)
          : undefined;

      setBlocksState((prev) => ({
        ...prev,
        nextBlockHeightToLoad: lastBlockHeightLoaded
          ? lastBlockHeightLoaded - 1
          : undefined,
        hasMoreBlocks: !!lastBlockHeightLoaded && lastBlockHeightLoaded > 1,
        blocksData: [...prev.blocksData, ...blockMetas],
      }));
    }

    if (error) {
      setBlocksState((prev) => ({
        ...prev,
        blocksError: error,
      }));
    }
  }, [error, loading, nextBlockHeightToLoad, refetch]);

  const refreshBlocks = useCallback(async () => {
    setBlocksState((prev) => ({
      ...prev,
      nextBlockHeightToLoad: undefined,
      hasMoreBlocks: true,
      blocksData: [],
    }));
  }, [setBlocksState]);

  return (
    <section>
      <RouteTitle>{t('Blocks')}</RouteTitle>
      <BlocksRefetch refetch={refreshBlocks} />
      <BlocksInfiniteList
        hasMoreBlocks={hasMoreBlocks}
        areBlocksLoading={areBlocksLoading}
        blocks={blocksData}
        loadMoreBlocks={loadBlocks}
        error={blocksError}
        className="mb-4"
      />
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
