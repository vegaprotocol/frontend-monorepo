import React from 'react';
import { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';
import { Routes } from '../../routes/router-config';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../seconds-ago';
import { Table, TableRow, TableCell } from '../table';

interface BlockProps {
  block: BlockMeta;
  className?: string;
}

export const BlockData = ({ block, className }: BlockProps) => {
  return (
    <Table
      aria-label={`Data for block ${block.header?.height}`}
      className={className}
    >
      <TableRow data-testid="block-row" modifier="background">
        <TableCell
          data-testid="block-height"
          className="pl-4 py-2"
          aria-label="Block height"
        >
          <Link
            to={`/${Routes.BLOCKS}/${block.header?.height}`}
            className="text-vega-yellow"
          >
            {block.header?.height}
          </Link>
        </TableCell>
        <TableCell
          data-testid="num-txs"
          className="px-8 text-center"
          aria-label="Number of transactions"
        >
          {block.num_txs === '1'
            ? '1 transaction'
            : `${block.num_txs} transactions`}
        </TableCell>
        <TableCell
          data-testid="validator-link"
          className="px-8 text-center"
          aria-label="Validator"
        >
          <Link to={`/${Routes.VALIDATORS}`}>
            {block.header.proposer_address}
          </Link>
        </TableCell>
        <TableCell
          data-testid="block-time"
          className="text-center pr-28 text-neutral-300"
          aria-label="Block genesis"
        >
          <SecondsAgo date={block.header?.time} />
        </TableCell>
      </TableRow>
    </Table>
  );
};
