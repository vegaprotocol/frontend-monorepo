import { calcCandleVolume, calcCandleVolumePrice } from '../../market-utils';
import {
  addDecimalsFormatNumber,
  formatNumber,
  isNumeric,
} from '@vegaprotocol/utils';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useCandles } from '../../hooks';
import { useT } from '../../use-t';

interface Props {
  marketId?: string;
  positionDecimalPlaces?: number;
  formatDecimals?: number;
  initialValue?: string;
  quoteUnit?: string;
  assetDecimals: number;
}

export const Last24hVolume = ({
  marketId,
  positionDecimalPlaces,
  formatDecimals,
  initialValue,
  quoteUnit,
  assetDecimals,
}: Props) => {
  const t = useT();
  const { oneDayCandles, fiveDaysCandles, error } = useCandles({
    marketId,
  });

  const nonIdeal = <span>{'-'}</span>;

  if (error || !oneDayCandles || !fiveDaysCandles) {
    return nonIdeal;
  }

  const candleVolume = oneDayCandles
    ? calcCandleVolume(oneDayCandles)
    : initialValue;

  const candleVolumePrice = oneDayCandles
    ? calcCandleVolumePrice(oneDayCandles, assetDecimals)
    : initialValue;

  return (
    <Tooltip
      description={t(
        'The total number of contracts traded in the last 24 hours. (Total value of contracts traded in the last 24 hours)'
      )}
    >
      <span>
        {candleVolume && isNumeric(positionDecimalPlaces)
          ? addDecimalsFormatNumber(
              candleVolume,
              positionDecimalPlaces,
              formatDecimals
            )
          : '-'}{' '}
        (
        {candleVolumePrice && isNumeric(positionDecimalPlaces)
          ? formatNumber(candleVolumePrice, formatDecimals)
          : '-'}{' '}
        {quoteUnit})
      </span>
    </Tooltip>
  );
};
