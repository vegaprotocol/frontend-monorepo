import { calcCandleVolume, calcCandleVolumePrice } from '../../market-utils';
import {
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
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
  const { oneDayCandles, fiveDaysCandles, error } = useCandles({
    marketId,
  });

  const nonIdeal = <span>{'-'}</span>;

  if (error || !oneDayCandles || !fiveDaysCandles) {
    return nonIdeal;
  }

  if (fiveDaysCandles.length < 24) {
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
                'Market has not been active for 24 hours. The volume traded between {{start}} and {{end}} is {{candleVolumeValue}} for a total of {{candleVolumePrice}} {{quoteUnit}}',
                {
                  start: getDateTimeFormat().format(
                    new Date(fiveDaysCandles[0].periodStart)
                  ),
                  end: getDateTimeFormat().format(
                    new Date(
                      fiveDaysCandles[fiveDaysCandles.length - 1].periodStart
                    )
                  ),
                  candleVolumeValue,
                  candleVolumePrice,
                  quoteUnit,
                }
              )}
            </span>
          </div>
        }
      >
        <span>{nonIdeal}</span>
      </Tooltip>
    );
  }

  if (oneDayCandles.length < 24) {
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
                '24 hour change is unavailable at this time. The volume change in the last 120 hours is {{candleVolumeValue}} for a total of ({{candleVolumePrice}} {{quoteUnit}})',
                { candleVolumeValue, candleVolumePrice, quoteUnit }
              )}
            </span>
          </div>
        }
      >
        <span>{nonIdeal}</span>
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
