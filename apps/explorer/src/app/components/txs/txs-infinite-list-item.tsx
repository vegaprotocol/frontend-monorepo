import React from 'react';
import { TruncatedLink } from '../truncate/truncated-link';
import { Routes } from '../../routes/route-names';
import { TxOrderType } from './tx-order-type';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { toHex } from '../search/detect-search';
import { ChainResponseCode } from './details/chain-response-code/chain-reponse.code';
import isNumber from 'lodash/isNumber';

const TRUNCATE_LENGTH = 5;

export const TxsInfiniteListItem = ({
  hash,
  code,
  submitter,
  type,
  block,
  command,
}: Partial<BlockExplorerTransactionResult>) => {
  if (
    !hash ||
    !submitter ||
    !type ||
    code === undefined ||
    block === undefined ||
    command === undefined
  ) {
    return <div>Missing vital data</div>;
  }

  return (
    <div
      data-testid="transaction-row"
      className="flex items-center h-full border-t border-neutral-600 dark:border-neutral-800 txs-infinite-list-item grid grid-cols-10 py-2"
    >
      <div
        className="text-sm col-span-10 xl:col-span-3 leading-none"
        data-testid="tx-hash"
      >
        <span className="xl:hidden uppercase text-vega-dark-300">
          ID:&nbsp;
        </span>
        <TruncatedLink
          to={`/${Routes.TX}/${toHex(hash)}`}
          text={hash}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </div>
      <div
        className="text-sm col-span-10 xl:col-span-3 leading-none"
        data-testid="pub-key"
      >
        <span className="xl:hidden uppercase text-vega-dark-300">
          By:&nbsp;
        </span>
        <TruncatedLink
          to={`/${Routes.PARTIES}/${submitter}`}
          text={submitter}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </div>
      <div className="text-sm col-span-5 xl:col-span-2 leading-none	flex items-center">
        <TxOrderType orderType={type} command={command} />
      </div>
      <div
        className="text-sm col-span-3 xl:col-span-1 leading-none flex items-center"
        data-testid="tx-block"
      >
        <span className="xl:hidden uppercase text-vega-dark-300">
          Block:&nbsp;
        </span>
        <TruncatedLink
          to={`/${Routes.BLOCKS}/${block}`}
          text={block}
          startChars={TRUNCATE_LENGTH}
          endChars={TRUNCATE_LENGTH}
        />
      </div>
      <div
        className="text-sm col-span-2 xl:col-span-1 leading-none flex items-center"
        data-testid="tx-success"
      >
        <span className="xl:hidden uppercase text-vega-dark-300">
          Success:&nbsp;
        </span>
        {isNumber(code) ? (
          <ChainResponseCode code={code} hideLabel={true} />
        ) : (
          code
        )}
      </div>
    </div>
  );
};
