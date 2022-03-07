import React from 'react';
import { TendermintBlockchainResponse } from '../../../routes/blocks/tendermint-blockchain-response';
import { Link } from 'react-router-dom';
import { SecondsAgo } from '../../seconds-ago';
import { TxsPerBlock } from '../../txs/txs-per-block';
import { Table } from '../../table';

interface BlocksProps {
  data: TendermintBlockchainResponse | undefined;
  showTransactions?: boolean;
}

export const BlocksTable = ({ data, showTransactions }: BlocksProps) => {
  if (!data?.result) {
    return <>No block data</>;
  }

  return (
    <Table>
      {data.result?.block_metas?.map((block, index) => {
        return (
          <React.Fragment key={index}>
            <tr data-testid="block-row">
              <td data-testid="block-height">
                <Link to={`/blocks/${block.header?.height}`}>
                  {block.header?.height}
                </Link>
              </td>
              <td data-testid="num-txs">
                {block.num_txs === '1'
                  ? '1 transaction'
                  : `${block.num_txs} transactions`}
              </td>
              <td data-testid="validator-link">
                <Link to={`/validators/${block.header?.proposer_address}`}>
                  {block.header.proposer_address}
                </Link>
              </td>
              <td data-testid="block-time">
                <SecondsAgo date={block.header?.time} />
              </td>
            </tr>
            {showTransactions && (
              <tr>
                <TxsPerBlock blockHeight={block.header?.height} />
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </Table>
  );
};
