import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';
import { BlockData } from './block-data';

interface BlocksInfiniteListProps {
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

export const BlocksInfiniteList = ({
  hasMoreBlocks,
  areBlocksLoading,
  blocks,
  loadMoreBlocks,
  error,
  className,
}: BlocksInfiniteListProps) => {
  if (!blocks) {
    return <div>No items</div>;
  }

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasMoreBlocks ? blocks.length + 1 : blocks.length;

  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const loadMoreItems = areBlocksLoading ? () => {} : loadMoreBlocks;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) =>
    !hasMoreBlocks || index < blocks.length;

  const Item = ({ index, style }: ItemProps) => {
    let content;
    if (error) {
      content = t(`${error}`);
    } else if (!isItemLoaded(index)) {
      content = t('Loading...');
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
