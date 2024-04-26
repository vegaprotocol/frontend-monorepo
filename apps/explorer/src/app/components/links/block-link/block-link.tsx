import React from 'react';
import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';
import { useExplorerEpochForBlockQuery } from './__generated__/EpochByBlock';
import { t } from '@vegaprotocol/i18n';

export type BlockLinkProps = Partial<ComponentProps<typeof Link>> & {
  height: string;
  showEpoch?: boolean;
};

const BlockLink = ({ height, showEpoch = false, ...props }: BlockLinkProps) => {
  return (
    <>
      <Link className="underline" {...props} to={`/${Routes.BLOCKS}/${height}`}>
        <Hash text={height} />
      </Link>
      {showEpoch && <EpochForBlock block={height} />}
    </>
  );
};

export function EpochForBlock(props: { block: string }) {
  const { error, data, loading } = useExplorerEpochForBlockQuery({
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-first',
    variables: { block: props.block },
  });

  // NOTE: 0.73.x & <0.74.2 can error showing epoch, so for now we hide loading
  // or error states and only display if we get usable data
  if (error || loading || !data) {
    return null;
  }

  return (
    <span className="ml-2" title={t('Epoch')}>
      <EpochSymbol />
      {data.epoch.id}
    </span>
  );
}

export const EPOCH_SYMBOL = 'ⓔ';

export function EpochSymbol() {
  return (
    <em
      title={t('Epoch')}
      className="mr-1 cursor-default text-xl leading-none align-text-bottom not-italic"
    >
      {EPOCH_SYMBOL}
    </em>
  );
}

export default BlockLink;
