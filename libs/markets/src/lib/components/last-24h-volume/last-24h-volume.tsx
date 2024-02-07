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
  marketDecimals?: number;
  quoteUnit?: string;
}

export const Last24hVolume = ({
  marketId,
  marketDecimals,
  positionDecimalPlaces,
  formatDecimals,
  initialValue,
  quoteUnit,
}: Props) => {
  const t = useT();
  const { oneDayCandles, fiveDaysCandles } = useCandles({
    marketId,
  });

  if (
    fiveDaysCandles &&
    fiveDaysCandles.length > 0 &&
    (!oneDayCandles || oneDayCandles?.length === 0)
  ) {
    const candleVolume = calcCandleVolume(fiveDaysCandles);
    const candleVolumePrice = calcCandleVolumePrice(
      fiveDaysCandles,
      marketDecimals,
      positionDecimalPlaces
    );
    const candleVolumeValue =
      candleVolume && isNumeric(positionDecimalPlaces)
        ? addDecimalsFormatNumber(
            candleVolume,
            positionDecimalPlaces,
            formatDecimals
          )
        : '-';
    return (
      <Tooltip
        description={
          <div>
            <span className="flex flex-col">
              {t(
                '24 hour change is unavailable at this time. The volume change in the last 120 hours is {{candleVolumeValue}} ({{candleVolumePrice}} {{quoteUnit}})',
                { candleVolumeValue, candleVolumePrice, quoteUnit }
              )}
            </span>
          </div>
        }
      >
        <span>-</span>
      </Tooltip>
    );
  }
  const candleVolume = oneDayCandles
    ? calcCandleVolume(oneDayCandles)
    : initialValue;

  const candleVolumePrice = oneDayCandles
    ? calcCandleVolumePrice(
        oneDayCandles,
        marketDecimals,
        positionDecimalPlaces
      )
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
