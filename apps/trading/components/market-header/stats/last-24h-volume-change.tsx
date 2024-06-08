import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { Last24hVolume } from '@vegaprotocol/markets';

type Last24hVolumeChangeStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  marketDecimalPlaces: number;
  positionDecimalPlaces: number;
  quoteUnit: string;
  baseUnit?: string;
};

/**
 * The last 24h volume change wrapped in a HeaderStat
 */
export const Last24hVolumeChangeStat = ({
  marketId,
  marketDecimalPlaces,
  positionDecimalPlaces,
  quoteUnit,
  baseUnit,
}: Last24hVolumeChangeStatProps) => {
  const t = useT();

  // TODO: Change this to use useMarket from apps/trading
  return (
    <HeaderStat heading={t('Volume (24h)')} data-testid="market-volume">
      <Last24hVolume
        marketId={marketId}
        positionDecimalPlaces={positionDecimalPlaces}
        marketDecimals={marketDecimalPlaces}
        quoteUnit={quoteUnit}
        baseUnit={baseUnit}
      />
    </HeaderStat>
  );
};
