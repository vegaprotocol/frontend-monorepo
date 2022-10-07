import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t } from '@vegaprotocol/react-helpers';
import { TxsInfiniteListItem } from './txs-infinite-list-item';
import type { BlockExplorerTransaction } from '../../routes/types/block-explorer-response';

interface TxsInfiniteListProps {
  hasMoreTxs: boolean;
  areTxsLoading: boolean | undefined;
  txs: BlockExplorerTransaction[] | undefined;
  loadMoreTxs: () => void;
  error: Error | undefined;
  className?: string;
}

interface ItemProps {
  index: BlockExplorerTransaction;
  style: React.CSSProperties;
  isLoading: boolean;
  error: Error | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

const Item = ({ index, style, isLoading, error }: ItemProps) => {
  let content;
  if (error) {
    content = t(`Cannot fetch transaction: ${error}`);
  } else if (isLoading) {
    content = t('Loading...');
  } else {
    const { hash, submitter, type, command, block, index: blockIndex } = index;
    content = (
      <TxsInfiniteListItem
        type={type}
        command={command}
        submitter={submitter}
        hash={hash}
        block={block}
        index={blockIndex}
      />
    );
  }

  return <div style={style}>{content}</div>;
};

export const TxsInfiniteList = ({
  hasMoreTxs,
  areTxsLoading,
  txs,
  loadMoreTxs,
  error,
  className,
}: TxsInfiniteListProps) => {
  if (!txs) {
    return <div>No items</div>;
  }

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasMoreTxs ? txs.length + 1 : txs.length;

  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const loadMoreItems = areTxsLoading ? NOOP : loadMoreTxs;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) => !hasMoreTxs || index < txs.length;

  return (
    <div className={className} data-testid="transactions-list">
      <div className="grid grid-flow-col auto-cols-auto w-full mb-8">
        <div className="text-lg font-bold pl-2">Type</div>
        <div className="text-lg font-bold">Submitted By</div>
        <div className="text-lg font-bold">Transaction ID</div>
        <div className="text-lg font-bold">Block</div>
      </div>
      <div data-testid="infinite-scroll-wrapper">
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
        >
          {({ onItemsRendered, ref }) => (
            <List
              className="List"
              height={595}
              itemCount={itemCount}
              itemSize={41}
              onItemsRendered={onItemsRendered}
              ref={ref}
              width={'100%'}
            >
              {({ index, style }) => (
                <Item
                  index={txs[index]}
                  style={style}
                  isLoading={!isItemLoaded(index)}
                  error={error}
                />
              )}
            </List>
          )}
        </InfiniteLoader>
      </div>
    </div>
  );
};
