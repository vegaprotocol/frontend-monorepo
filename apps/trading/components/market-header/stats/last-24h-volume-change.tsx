import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { Last24hVolume } from '@vegaprotocol/markets';

type Last24hVolumeChangeStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  marketDecimalPlaces: number;
  positionDecimalPlaces: number;
  quoteUnit: string;
};

export const Last24hVolumeChangeStat = ({
  marketId,
  marketDecimalPlaces,
  positionDecimalPlaces,
  quoteUnit,
}: Last24hVolumeChangeStatProps) => {
  const t = useT();

  return (
    <HeaderStat heading={t('Volume (24h)')} data-testid="market-volume">
      <Last24hVolume
        marketId={marketId}
        positionDecimalPlaces={positionDecimalPlaces}
        marketDecimals={marketDecimalPlaces}
        quoteUnit={quoteUnit}
      />
    </HeaderStat>
  );
};
