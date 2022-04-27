import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';

interface BlocksInfiniteListProps {
  hasMoreBlocks: boolean;
  areBlocksLoading: boolean | undefined;
  items: BlockMeta[] | undefined;
  loadMoreBlocks: () => void;
  error: Error | undefined;
}

interface ItemProps {
  index: number;
  style: React.CSSProperties;
}

export const BlocksInfiniteList = ({
  hasMoreBlocks,
  areBlocksLoading,
  items,
  loadMoreBlocks,
  error,
}: BlocksInfiniteListProps) => {
  if (!items) {
    return <div>No items</div>;
  }

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasMoreBlocks ? items.length + 1 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const loadMoreItems = areBlocksLoading ? () => {} : loadMoreBlocks;

  // TODO !!!! NOTICE - not sure if this is needed?

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) =>
    !hasMoreBlocks || index < items.length;

  // Render an item or a loading indicator.
  const Item = ({ index, style }: ItemProps) => {
    let content;
    // console.log(hasMoreBlocks, index, items.length);
    if (!isItemLoaded(index)) {
      content = t('Loading...');
    } else if (error) {
      content = t(`Error: ${error}`);
    } else {
      content = items[index].header.height;
    }

    return <div style={style}>{content}</div>;
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {/* @ts-ignore -    foo bar */}
      {({ onItemsRendered, ref }) => (
        <List
          className="List"
          height={150}
          itemCount={itemCount}
          itemSize={20}
          onItemsRendered={onItemsRendered}
          ref={ref}
          width={300}
        >
          {Item}
        </List>
      )}
    </InfiniteLoader>
  );
};
