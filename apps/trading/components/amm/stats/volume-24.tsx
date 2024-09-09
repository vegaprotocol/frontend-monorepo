import { useCandleData, type Market } from '@vegaprotocol/rest';

import { LoaderCircleIcon } from 'lucide-react';
import { Currency } from '../currency';
import { CompactNumber } from '@vegaprotocol/react-helpers';
import BigNumber from 'bignumber.js';

export const Volume24 = ({ market }: { market: Market }) => {
  const { notional, status } = useCandleData(market.id);

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

export const CompactVolume24 = ({ market }: { market: Market }) => {
  const { notional, status } = useCandleData(market.id);

  if (status === 'pending') {
    return (
      <div className="h-4 py-1">
        <LoaderCircleIcon size={14} className="animate-spin" />
      </div>
    );
  }

  return (
    <CompactNumber
      number={notional || BigNumber(0)}
      decimals={2}
      compactAbove={1000}
    />
  );
};
