import { t } from '@vegaprotocol/react-helpers';
import React from 'react';
import type { TendermintBlockchainResponse } from '../../routes/blocks/tendermint-blockchain-response';
import { BlockData } from './block-data';

interface BlocksProps {
  data: TendermintBlockchainResponse | undefined;
  className?: string;
}

export const BlocksData = ({ data, className }: BlocksProps) => {
  if (!data?.result) {
    return <div className={className}>{t('Awaiting block data')}</div>;
  }

  return (
    <ul
      aria-label={t(
        `Showing ${data.result?.block_metas.length} most recently loaded blocks`
      )}
      className={className}
    >
      {data.result?.block_metas?.map((block, index) => {
        return (
          <li key={index}>
            <BlockData block={block} />
          </li>
        );
      })}
    </ul>
  );
};
