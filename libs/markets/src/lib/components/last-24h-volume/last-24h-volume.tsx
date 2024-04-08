import { calcCandleVolume, calcCandleVolumePrice } from '../../market-utils';
import { addDecimalsFormatNumber, formatNumber } from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useCandles } from '../../hooks';
import { useT } from '../../use-t';

interface Last24hVolumeProps {
  marketId?: string;
  positionDecimalPlaces: number;
  marketDecimals: number;
  formatDecimals?: number;
  quoteUnit?: string;
  baseUnit?: string;
}

export const Last24hVolume = ({
  marketId,
  marketDecimals,
  positionDecimalPlaces,
  formatDecimals,
  quoteUnit,
  baseUnit,
}: Last24hVolumeProps) => {
  const t = useT();
  const { oneDayCandles, fiveDaysCandles, error } = useCandles({
    marketId,
  });

  const nonIdeal = <span>{'-'}</span>;

  if (error || !oneDayCandles || !fiveDaysCandles) {
    return nonIdeal;
  }

  const candleVolume = calcCandleVolume(oneDayCandles);
  const candleVolumePrice = calcCandleVolumePrice(
    oneDayCandles,
    marketDecimals,
    positionDecimalPlaces
  );

  return (
    <Tooltip
      description={t(
        'The total number of contracts traded in the last 24 hours. (Total value of contracts traded in the last 24 hours)'
      )}
    >
      <span className="flex gap-1">
        <span>
          {candleVolume
            ? addDecimalsFormatNumber(candleVolume, positionDecimalPlaces)
            : '-'}
          {baseUnit && ' ' + baseUnit}
        </span>
        <span>
          (
          {candleVolumePrice
            ? formatNumber(candleVolumePrice, formatDecimals)
            : '-'}
          {quoteUnit && ' ' + quoteUnit})
        </span>
      </span>
    </Tooltip>
  );
};
