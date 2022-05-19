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
  index: number;
  style: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {};

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

  const Item = ({ index, style }: ItemProps) => {
    let content;
    if (error) {
      content = t(`${error}`);
    } else if (!isItemLoaded(index)) {
      content = t('Loading...');
    } else {
      const { TxHash, PubKey, Type, Command, Sig, Nonce } = txs[index];
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

  return (
    <div className={className} data-testid="infinite-scroll-wrapper">
      <div className="grid grid-cols-3 gap-12 w-full mb-8">
        <div className="text-h5 font-bold text-center">Txn hash</div>
        <div className="text-h5 font-bold text-center">Party</div>
        <div className="text-h5 font-bold text-center">Type</div>
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
            {Item}
          </List>
        )}
      </InfiniteLoader>
    </div>
  );
};
