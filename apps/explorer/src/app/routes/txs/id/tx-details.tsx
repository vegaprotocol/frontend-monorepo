import { Routes } from '../../route-names';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransactionResult } from '../../../routes/types/block-explorer-response';
import React from 'react';
import { TruncateInline } from '../../../components/truncate/truncate';
import { Link } from 'react-router-dom';

interface TxDetailsProps {
  txData: BlockExplorerTransactionResult | undefined;
  pubKey: string | undefined;
  className?: string;
}

export const txDetailsTruncateLength = 30;

export const TxDetails = ({ txData, pubKey, className }: TxDetailsProps) => {
  if (!txData) {
    return <>{t('Awaiting Block Explorer transaction details')}</>;
  }

  const truncatedSubmitter = (
    <TruncateInline text={pubKey || ''} startChars={5} endChars={5} />
  );

  return (
    <section className="mb-10">
      <h3 className="text-3xl xl:text-4xl uppercase font-alpha mb-4">
        {txData.type} by{' '}
        <Link
          className="font-bold underline"
          to={`/${Routes.PARTIES}/${pubKey}`}
        >
          {truncatedSubmitter}
        </Link>
      </h3>
      <p className="text-xl xl:text-2xl uppercase font-alpha">
        Block{' '}
        <Link
          className="font-bold underline"
          to={`/${Routes.BLOCKS}/${txData.block}`}
        >
          {txData.block}
        </Link>
        {', '}
        Index {txData.index}
      </p>
    </section>
  );
};
