import React from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { t } from '@vegaprotocol/react-helpers';
import type { ChainExplorerTxResponse } from '../../routes/types/chain-explorer-response';
import { TableWithTbody, TableCell, TableRow } from '../table';
import { TruncatedLink } from '../truncate/truncated-link';
import { Routes } from '../../routes/route-names';
import { TxOrderType } from './tx-order-type';

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
const truncateLength = 14;

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
      const { TxHash, PubKey, Type } = txs[index];
      content = (
        <TableWithTbody>
          <TableRow
            modifier="bordered"
            key={TxHash}
            data-testid="transaction-row"
          >
            <TableCell modifier="bordered" className="pr-12">
              <TruncatedLink
                to={`/${Routes.TX}/${TxHash}`}
                text={TxHash}
                startChars={truncateLength}
                endChars={truncateLength}
              />
            </TableCell>
            <TableCell modifier="bordered" className="pr-12">
              <TruncatedLink
                to={`/${Routes.PARTIES}/${PubKey}`}
                text={PubKey}
                startChars={truncateLength}
                endChars={truncateLength}
              />
            </TableCell>
            <TableCell modifier="bordered">
              <TxOrderType orderType={Type} />
            </TableCell>
          </TableRow>
        </TableWithTbody>
      );
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
            itemSize={33}
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
