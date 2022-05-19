import React, { useState } from 'react';
import {
  Dialog,
  Icon,
  Intent,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';
import { TruncatedLink } from '../truncate/truncated-link';
import { Routes } from '../../routes/route-names';
import { TxOrderType } from './tx-order-type';
import type { ChainExplorerTxResponse } from '../../routes/types/chain-explorer-response';

const truncateLength = 14;

export const TxsInfiniteListItem = ({
  TxHash,
  PubKey,
  Type,
  Command,
}: ChainExplorerTxResponse) => {
  const [open, setOpen] = useState(false);

  if (!TxHash || !PubKey || !Type || !Command) {
    return <div>Missing vital data</div>;
  }

  return (
    <div className="grid grid-cols-[auto_1fr_200px_auto] gap-12 w-full border-t border-black-60 dark:border-white-25 py-8 txs-infinite-list-item">
      <div className="whitespace-nowrap overflow-scroll" data-testid="tx-hash">
        <TruncatedLink
          to={`/${Routes.TX}/${TxHash}`}
          text={TxHash}
          startChars={truncateLength}
          endChars={truncateLength}
        />
      </div>
      <div
        className="whitespace-nowrap text-center overflow-scroll"
        data-testid="pub-key"
      >
        <TruncatedLink
          to={`/${Routes.PARTIES}/${PubKey}`}
          text={PubKey}
          startChars={truncateLength}
          endChars={truncateLength}
        />
      </div>
      <div className="whitespace-nowrap overflow-scroll" data-testid="type">
        <TxOrderType orderType={Type} />
      </div>
      <button
        title="More details"
        onClick={() => setOpen(true)}
        data-testid="command-details"
      >
        <Icon name="search-template" />
        <Dialog
          open={open}
          onChange={(isOpen) => setOpen(isOpen)}
          width="auto"
          intent={Intent.Help}
        >
          <SyntaxHighlighter data={JSON.parse(Command)} />
        </Dialog>
      </button>
    </div>
  );
};
