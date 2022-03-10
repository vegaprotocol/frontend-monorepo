import React from 'react';
import { TendermintBlockchainResponse } from '../../../routes/blocks/tendermint-blockchain-response';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../../seconds-ago';
import { TxsPerBlock } from '../../txs/txs-per-block';
import { Table, TableRow, TableCell } from '../../table';

interface BlocksProps {
  data: TendermintBlockchainResponse | undefined;
  showTransactions?: boolean;
}

export const BlocksTable = ({ data, showTransactions }: BlocksProps) => {
  if (!data?.result) {
    return <div className="mb-28">Awaiting block data</div>;
  }

  return (
    <Table>
      {data.result?.block_metas?.map((block, index) => {
        return (
          <React.Fragment key={index}>
            <TableRow dataTestId="block-row" modifier="background">
              <TableCell dataTestId="block-height" className="pl-4 py-2">
                <Link
                  to={`/blocks/${block.header?.height}`}
                  className="text-vega-yellow"
                >
                  {block.header?.height}
                </Link>
              </TableCell>
              <TableCell dataTestId="num-txs" className="px-8 text-center">
                {block.num_txs === '1'
                  ? '1 transaction'
                  : `${block.num_txs} transactions`}
              </TableCell>
              <TableCell
                dataTestId="validator-link"
                className="px-8 text-center"
              >
                <Link to={`/validators/${block.header?.proposer_address}`}>
                  {block.header.proposer_address}
                </Link>
              </TableCell>
              <TableCell
                dataTestId="block-time"
                className="text-center pr-28 text-neutral-300"
              >
                <SecondsAgo date={block.header?.time} />
              </TableCell>
            </TableRow>
            {showTransactions && (
              <TableRow>
                <TxsPerBlock blockHeight={block.header?.height} />
              </TableRow>
            )}
          </React.Fragment>
        );
      })}
    </Table>
  );
};
