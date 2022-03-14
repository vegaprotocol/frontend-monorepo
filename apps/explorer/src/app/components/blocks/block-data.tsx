import React from 'react';
import { BlockMeta } from '../../routes/blocks/tendermint-blockchain-response';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../seconds-ago';
import { Table, TableRow, TableCell } from '../table';

interface BlockProps {
  block: BlockMeta;
}

export const BlockData = ({ block }: BlockProps) => {
  return (
    <Table aria-label={`Data for block ${block.header?.height}`}>
      <TableRow dataTestId="block-row" modifier="background">
        <TableCell
          dataTestId="block-height"
          className="pl-4 py-2"
          aria-label="Block height"
        >
          <Link
            to={`/blocks/${block.header?.height}`}
            className="text-vega-yellow"
          >
            {block.header?.height}
          </Link>
        </TableCell>
        <TableCell
          dataTestId="num-txs"
          className="px-8 text-center"
          aria-label="Number of transactions"
        >
          {block.num_txs === '1'
            ? '1 transaction'
            : `${block.num_txs} transactions`}
        </TableCell>
        <TableCell
          dataTestId="validator-link"
          className="px-8 text-center"
          aria-label="Validator"
        >
          <Link to={`/validators/${block.header?.proposer_address}`}>
            {block.header.proposer_address}
          </Link>
        </TableCell>
        <TableCell
          dataTestId="block-time"
          className="text-center pr-28 text-neutral-300"
          aria-label="Block genesis"
        >
          <SecondsAgo date={block.header?.time} />
        </TableCell>
      </TableRow>
    </Table>
  );
};
