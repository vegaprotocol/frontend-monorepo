import React from 'react';
import { Routes } from '../../../routes/route-names';
import { useExplorerMarketQuery } from './__generated__/Market';
import { Link } from 'react-router-dom';

export type MarketLinkProps = {
  id: string;
};

/**
 * Given a market ID, it will fetch the market name and show that,
 * with a link to the markets list. If the name does not come back
 * it will use the ID instead
 */
const MarketLink = ({ id, ...props }: MarketLinkProps) => {
  const { data } = useExplorerMarketQuery({
    variables: { id },
  });

  let label: string = id;

  if (data?.market?.tradableInstrument.instrument.name) {
    label = data.market.tradableInstrument.instrument.name;
  }

  return (
    <Link className="underline" to={`/${Routes.MARKETS}#${id}`} {...props}>
      {label}
    </Link>
  );
};

export default MarketLink;
