import { Routes } from '../../../routes/route-names';
import { useExplorerMarketQuery } from './__generated__/Market';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import { t } from '@vegaprotocol/i18n';
import Hash from '../hash';
import { EmblemWithChain } from '../../emblem-with-chain/emblem-with-chain';

export type MarketLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
  showMarketName?: boolean;
};

/**
 * Given a market ID, it will fetch the market name and show that,
 * with a link to the markets list. If the name does not come back
 * it will use the ID instead
 */
const MarketLink = ({
  id,
  showMarketName = true,
  ...props
}: MarketLinkProps) => {
  const { data, error, loading } = useExplorerMarketQuery({
    variables: { id },
    fetchPolicy: 'cache-first',
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
          &nbsp;
          <Hash text={id} />
        </div>
      );
    }
  }

  if (showMarketName) {
    return (
      <Link
        className="underline"
        {...props}
        to={`/${Routes.MARKETS}/${id}`}
        title={id}
      >
        <span className="mr-1">
          <EmblemWithChain market={id} />
        </span>
        {label}
      </Link>
    );
  } else {
    return (
      <Link className="underline" {...props} to={`/${Routes.MARKETS}/${id}`}>
        <span className="mr-1">
          <EmblemWithChain market={id} />
        </span>
        <Hash text={id} />
      </Link>
    );
  }
};

export default MarketLink;
