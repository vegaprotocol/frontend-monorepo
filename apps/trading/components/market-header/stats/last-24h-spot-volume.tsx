import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { type HTMLAttributes } from 'react';
import { useCandles } from '@vegaprotocol/markets';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';

type Last24hSpotVolumeStatProps = HTMLAttributes<HTMLDivElement> & {
  marketId: string;
  marketDecimalPlaces: number;
  baseAsset: {
    symbol: string;
    decimals: number;
  };
  quoteAsset: {
    symbol: string;
    decimals: number;
  };
};

/**
 * The last 24h volume change wrapped in a HeaderStat
 */
export const Last24hSpotVolumeStat = ({
  marketId,
  marketDecimalPlaces,
  baseAsset,
  quoteAsset,
}: Last24hSpotVolumeStatProps) => {
  const t = useT();

  return (
    <HeaderStat heading={t('Volume (24h)')} data-testid="market-volume">
      <SpotVolumeStat
        marketId={marketId}
        baseAsset={baseAsset}
        quoteAsset={quoteAsset}
        marketDecimalPlaces={marketDecimalPlaces}
      />
    </HeaderStat>
  );
};

const SpotVolumeStat = ({
  marketId,
  baseAsset,
  quoteAsset,
  marketDecimalPlaces,
}: {
  marketId: string;
  baseAsset: {
    symbol: string;
    decimals: number;
  };
  quoteAsset: {
    symbol: string;
    decimals: number;
  };
  marketDecimalPlaces: number;
}) => {
  const t = useT();
  const { oneDayCandles, error } = useCandles({
    marketId,
  });

  if (error || !oneDayCandles) {
    return <span>{'-'}</span>;
  }

  let totalBaseVolume = new BigNumber(0);
  let totalQuoteVolume = new BigNumber(0);

  oneDayCandles.forEach((candle) => {
    if (candle.volume === '0') return;
    const volume = toBigNum(candle.volume, baseAsset.decimals);
    totalBaseVolume = totalBaseVolume.plus(volume);

    // Assuming close price represents the price in USDC
    const closePrice = toBigNum(candle.close, marketDecimalPlaces);
    totalQuoteVolume = totalQuoteVolume.plus(volume.times(closePrice));
  });

  return (
    <Tooltip
      description={t(
        'The total number of contracts traded in the last 24 hours. (Total value of contracts traded in the last 24 hours)'
      )}
    >
      <span className="flex gap-1">
        <span>
          {formatNumber(totalBaseVolume, baseAsset.decimals)} {baseAsset.symbol}
        </span>
        <span>
          ({formatNumber(totalQuoteVolume, quoteAsset.decimals)}{' '}
          {quoteAsset.symbol})
        </span>
      </span>
    </Tooltip>
  );
};
