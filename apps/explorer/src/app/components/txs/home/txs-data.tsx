import React from 'react';
import { TendermintBlockchainResponse } from '../../../routes/blocks/tendermint-blockchain-response';
import { BlockData } from '../../blocks';
import { TxsPerBlock } from '../txs-per-block';

interface TxsProps {
  data: TendermintBlockchainResponse | undefined;
  className?: string;
}

export const TxsData = ({ data, className }: TxsProps) => {
  if (!data?.result) {
    return <div className={className}>Awaiting block data</div>;
  }

  return (
    <ul
      aria-label={`Showing ${data.result?.block_metas.length} most recently loaded blocks and transactions`}
      className={className}
    >
      {data.result?.block_metas?.map((block, index) => {
        return (
          <li key={index} data-testid="block-row">
            <BlockData block={block} />
            <TxsPerBlock blockHeight={block.header.height} />
          </li>
        );
      })}
    </ul>
  );
};
