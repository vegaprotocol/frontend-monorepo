import React from 'react';
import type { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';
import { Routes } from '../../routes/route-names';
import { Link } from 'react-router-dom';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { TimeAgo } from '../time-ago';
import { TableWithTbody, TableRow, TableCell } from '../table';
import { t } from '@vegaprotocol/react-helpers';

interface BlockProps {
  block: BlockMeta;
  className?: string;
}

export const BlockData = ({ block, className }: BlockProps) => {
  return (
    <TableWithTbody
      aria-label={`Data for block ${block.header?.height}`}
      className={`${className} block-data-table`}
    >
      <TableRow data-testid="block-row" modifier="background">
        <TableCell
          data-testid="block-height"
          className="pl-4 py-2 font-mono"
          aria-label={t('Block height')}
        >
          <Link
            to={`/${Routes.BLOCKS}/${block.header?.height}`}
            className="font-bold underline"
          >
            {block.header?.height}
          </Link>
        </TableCell>
        <TableCell
          data-testid="num-txs"
          className="px-8 text-center"
          aria-label={t('Number of transactions')}
        >
          {block.num_txs === '1'
            ? t('1 transaction')
            : t(`${block.num_txs} transactions`)}
        </TableCell>
        <TableCell
          data-testid="validator-link"
          className="px-8 text-center font-mono"
          aria-label={t('Validator')}
        >
          <Link to={`/${Routes.VALIDATORS}`}>
            {block.header.proposer_address}
          </Link>
        </TableCell>
        <TableCell
          data-testid="block-time"
          className="text-center pr-28 text-neutral-300 w-[170px]"
          aria-label={t('Block genesis')}
        >
          <Tooltip
            description={getDateTimeFormat().format(
              new Date(block.header.time)
            )}
          >
            {/*For some reason we get forwardRef errors if we pass in the TimeAgo component directly*/}
            <span>
              <TimeAgo date={block.header.time} />
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
