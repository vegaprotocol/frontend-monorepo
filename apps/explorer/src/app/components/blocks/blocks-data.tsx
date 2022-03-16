import React from 'react';
import { TendermintBlockchainResponse } from '../../routes/blocks/tendermint-blockchain-response';
import { BlockData } from './block-data';

interface BlocksProps {
  data: TendermintBlockchainResponse | undefined;
  className?: string;
}

export const BlocksData = ({ data, className }: BlocksProps) => {
  if (!data?.result) {
    return <div className={className}>Awaiting block data</div>;
  }

  return (
    <ul
      aria-label={`Showing ${data.result?.block_metas.length} most recently loaded blocks`}
      className={className}
    >
      {data.result?.block_metas?.map((block, index) => {
        return (
          <li key={index} data-testid="block-table">
            <BlockData block={block} />
          </li>
        );
      })}
    </ul>
  );
};
