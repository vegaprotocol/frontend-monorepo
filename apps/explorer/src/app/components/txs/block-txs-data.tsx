import React from 'react';
import { TendermintBlockchainResponse } from '../../routes/blocks/tendermint-blockchain-response';
import { BlockData } from '../blocks';
import { TxsPerBlock } from './txs-per-block';

interface TxsProps {
  data: TendermintBlockchainResponse | undefined;
  className?: string;
}

export const BlockTxsData = ({ data, className }: TxsProps) => {
  if (!data?.result) {
    // Data for the block has already been fetched at this point, so no errors
    // or loading to deal with. This is specifically the case
    // where the data object is not undefined, but lacks a result.
    return <div className={className}>No data</div>;
  }

  return (
    <ul
      aria-label={`Showing ${data.result?.block_metas.length} most recently loaded blocks and transactions`}
      className={className}
    >
      {data.result?.block_metas?.map((block, index) => {
        return (
          <li key={index} data-testid="transactions-list">
            <BlockData block={block} className="mb-12" />
            <TxsPerBlock blockHeight={block.header.height} />
          </li>
        );
      })}
    </ul>
  );
};
