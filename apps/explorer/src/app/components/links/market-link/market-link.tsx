import React from 'react';
import { Routes } from '../../../routes/route-names';
import { useExplorerMarketQuery } from './__generated__/Market';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import { t } from '@vegaprotocol/react-helpers';

export type MarketLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

/**
 * Given a market ID, it will fetch the market name and show that,
 * with a link to the markets list. If the name does not come back
 * it will use the ID instead
 */
const MarketLink = ({ id, ...props }: MarketLinkProps) => {
  const { data, error, loading } = useExplorerMarketQuery({
    variables: { id },
  });

  let label = <span>{id}</span>;

  if (!loading) {
    if (data?.market?.tradableInstrument.instrument.name) {
      label = <span>{data.market.tradableInstrument.instrument.name}</span>;
    } else if (error) {
      label = (
        <div title={t('Unknown market')}>
          <span role="img" aria-label="Unknown market" className="img">
            ⚠️&nbsp;{t('Invalid market')}
          </span>
          &nbsp;{id}
        </div>
      );
    }
  }

  return (
    <Link className="underline" {...props} to={`/${Routes.MARKETS}#${id}`}>
      {label}
    </Link>
  );
};

export default MarketLink;
