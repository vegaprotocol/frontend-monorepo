import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t } from '@vegaprotocol/react-helpers';
import { TxsInfiniteListItem } from './txs-infinite-list-item';
import type { ChainExplorerTxResponse } from '../../routes/types/chain-explorer-response';

interface TxsInfiniteListProps {
  hasMoreTxs: boolean;
  areTxsLoading: boolean | undefined;
  txs: ChainExplorerTxResponse[] | undefined;
  loadMoreTxs: () => void;
  error: Error | undefined;
  className?: string;
}

interface ItemProps {
  index: ChainExplorerTxResponse;
  style: React.CSSProperties;
  isLoading: boolean;
  error: Error | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

const Item = ({ index, style, isLoading, error }: ItemProps) => {
  let content;
  if (error) {
    content = t(`${error}`);
  } else if (isLoading) {
    content = t('Loading...');
  } else {
    const { TxHash, PubKey, Type, Command, Sig, Nonce } = index;
    content = (
      <TxsInfiniteListItem
        Type={Type}
        Command={Command}
        Sig={Sig}
        PubKey={PubKey}
        Nonce={Nonce}
        TxHash={TxHash}
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
    <div className={className} data-testid="infinite-scroll-wrapper">
      <div className="grid grid-cols-[repeat(2,_1fr)_240px] gap-12 w-full mb-8">
        <div className="text-h5 font-bold">Txn hash</div>
        <div className="text-h5 font-bold">Party</div>
        <div className="text-h5 font-bold pl-2">Type</div>
      </div>
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
  );
};
