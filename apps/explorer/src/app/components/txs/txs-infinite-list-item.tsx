import React from 'react';
import { TruncatedLink } from '../truncate/truncated-link';
import { Routes } from '../../routes/route-names';
import { TxOrderType } from './tx-order-type';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { toHex } from '../search/detect-search';

const TRUNCATE_LENGTH = 14;

export const TxsInfiniteListItem = ({
  hash,
  submitter,
  type,
  block,
  index,
}: Partial<BlockExplorerTransactionResult>) => {
  if (
    !hash ||
    !submitter ||
    !type ||
    block === undefined ||
    index === undefined
  ) {
    return <div>Missing vital data</div>;
  }

  return (
    <div
      data-testid="transaction-row"
      className="grid grid-flow-col auto-cols-auto border-t border-neutral-600 dark:border-neutral-800 py-2 txs-infinite-list-item"
    >
      <div className="whitespace-nowrap" data-testid="tx-type">
        <TxOrderType orderType={type} />
      </div>
      <div className="whitespace-nowrap" data-testid="pub-key">
        <TruncatedLink
          to={`/${Routes.PARTIES}/${submitter}`}
          text={submitter}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </div>
      <div className="whitespace-nowrap" data-testid="tx-hash">
        <TruncatedLink
          to={`/${Routes.TX}/${toHex(hash)}`}
          text={hash}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </div>
      <div className="whitespace-nowrap" data-testid="tx-block">
        <TruncatedLink
          to={`/${Routes.BLOCKS}/${block}`}
          text={`Block ${block} (index ${index})`}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </div>
    </div>
  );
};
