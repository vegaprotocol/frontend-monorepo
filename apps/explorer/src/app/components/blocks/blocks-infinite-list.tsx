import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t } from '@vegaprotocol/i18n';
import type { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';
import { BlockData } from './block-data';
import EmptyList from '../empty-list/empty-list';
import { Loader } from '@vegaprotocol/ui-toolkit';

export interface BlocksInfiniteListProps {
  hasMoreBlocks: boolean;
  areBlocksLoading: boolean | undefined;
  blocks: BlockMeta[] | undefined;
  loadMoreBlocks: () => void;
  error: Error | undefined;
  className?: string;
}

interface ItemProps {
  index: number;
  style: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

export const BlocksInfiniteList = ({
  hasMoreBlocks,
  areBlocksLoading,
  blocks,
  loadMoreBlocks,
  error,
  className,
}: BlocksInfiniteListProps) => {
  if (!blocks) {
    if (!areBlocksLoading) {
      return (
        <EmptyList
          heading={t('This chain has 0 blocks')}
          label={t('Check back soon')}
        />
      );
    } else {
      return <Loader />;
    }
  }

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasMoreBlocks ? blocks.length + 1 : blocks.length;

  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const loadMoreItems = areBlocksLoading ? NOOP : loadMoreBlocks;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) =>
    !hasMoreBlocks || index < blocks.length;

  const Item = ({ index, style }: ItemProps) => {
    let content;
    if (error) {
      content = t(`${error}`);
    } else if (!isItemLoaded(index)) {
      content = <Loader />;
    } else {
      content = <BlockData block={blocks[index]} />;
    }

    return <div style={style}>{content}</div>;
  };

  return (
    <div className={className} data-testid="infinite-scroll-wrapper">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            className="List"
            height={585}
            itemCount={itemCount}
            itemSize={30}
            onItemsRendered={onItemsRendered}
            ref={ref}
            width={'100%'}
          >
            {Item}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
};
