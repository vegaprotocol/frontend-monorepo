import React from 'react';
import type { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';
import { Routes } from '../../routes/router-config';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../seconds-ago';
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
      className={className}
    >
      <TableRow data-testid="block-row" modifier="background">
        <TableCell
          data-testid="block-height"
          className="pl-4 py-2 font-mono"
          aria-label={t('Block height')}
        >
          <Link
            to={`/${Routes.BLOCKS}/${block.header?.height}`}
            className="text-vega-pink dark:text-vega-yellow"
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
          <SecondsAgo date={block.header?.time} />
        </TableCell>
      </TableRow>
    </TableWithTbody>
  );
};
