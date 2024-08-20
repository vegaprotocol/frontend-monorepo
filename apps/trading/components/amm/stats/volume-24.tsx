import { useVolume24, type Market } from '@vegaprotocol/rest';

import { LoaderCircleIcon } from 'lucide-react';
import { Currency } from '../currency';

export const Volume24 = ({ market }: { market: Market }) => {
  const { notional, status } = useVolume24(market.id);

  if (status === 'pending') {
    return (
      <div className="h-4 py-1">
        <LoaderCircleIcon size={16} className="animate-spin" />
      </div>
    );
  }

  return (
    <Currency
      value={notional}
      asset={market.quoteAsset}
      formatDecimals={market.positionDecimalPlaces}
    />
  );
};
