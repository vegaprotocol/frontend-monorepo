import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t, useScreenDimensions } from '@vegaprotocol/utils';
import { TxsInfiniteListItem } from './txs-infinite-list-item';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import EmptyList from '../empty-list/empty-list';
import { Loader } from '@vegaprotocol/ui-toolkit';

interface TxsInfiniteListProps {
  hasMoreTxs: boolean;
  areTxsLoading: boolean | undefined;
  txs: BlockExplorerTransactionResult[] | undefined;
  loadMoreTxs: () => void;
  error: Error | undefined;
  className?: string;
}

interface ItemProps {
  index: BlockExplorerTransactionResult;
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
    content = <Loader />;
  } else {
    const {
      hash,
      submitter,
      type,
      command,
      block,
      code,
      index: blockIndex,
    } = index;
    content = (
      <TxsInfiniteListItem
        type={type}
        code={code}
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
  const { screenSize } = useScreenDimensions();
  const isStacked = ['xs', 'sm', 'md', 'lg'].includes(screenSize);

  if (!txs) {
    if (!areTxsLoading) {
      return (
        <EmptyList
          heading={t('This chain has 0 transactions')}
          label={t('Check back soon')}
        />
      );
    } else {
      return <Loader />;
    }
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
      <div className="xl:grid grid-cols-10 w-full mb-3 hidden text-vega-dark-300 uppercase">
        <div className="col-span-3">
          <span className="hidden xl:inline">Transaction &nbsp;</span>
          <span>ID</span>
        </div>
        <div className="col-span-3">Submitted By</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-1">Block</div>
        <div className="col-span-1">Success</div>
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
              height={995}
              itemCount={itemCount}
              itemSize={isStacked ? 134 : 50}
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
