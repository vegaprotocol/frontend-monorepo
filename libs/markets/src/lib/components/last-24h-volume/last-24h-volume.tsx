import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { marketCandlesProvider } from '../../market-candles-provider';
import { calcCandleVolume } from '../../market-utils';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { useFiveDaysAgo, useYesterday } from '@vegaprotocol/react-helpers';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import { isCandleLessThan24hOld } from '../last-24h-price-change';
import { t } from '@vegaprotocol/i18n';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

interface Props {
  marketId?: string;
  positionDecimalPlaces?: number;
  formatDecimals?: number;
  inViewRoot?: RefObject<Element>;
  initialValue?: string;
}

export const Last24hVolume = ({
  marketId,
  positionDecimalPlaces,
  formatDecimals,
  inViewRoot,
  initialValue,
}: Props) => {
  const yesterday = useYesterday();
  const fiveDaysAgo = useFiveDaysAgo();
  const [ref, inView] = useInView({ root: inViewRoot?.current });

  const { data } = useThrottledDataProvider({
    dataProvider: marketCandlesProvider,
    variables: {
      marketId: marketId || '',
      interval: Schema.Interval.INTERVAL_I1H,
      since: new Date(fiveDaysAgo).toISOString(),
    },
    skip: !(inView && marketId),
  });

  const fiveDaysCandles = data?.filter((candle) => Boolean(candle));

  const oneDayCandles = fiveDaysCandles?.filter((candle) =>
    isCandleLessThan24hOld(candle, yesterday)
  );

  if (
    fiveDaysCandles &&
    fiveDaysCandles.length > 0 &&
    (!oneDayCandles || oneDayCandles?.length === 0)
  ) {
    const candleVolume = calcCandleVolume(fiveDaysCandles);
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
                '24 hour change is unavailable at this time. The volume change in the last 120 hours is %s',
                [candleVolumeValue]
              )}
            </span>
          </div>
        }
      >
        <span ref={ref}>{t('Unknown')} </span>
      </Tooltip>
    );
  }
  const candleVolume = oneDayCandles
    ? calcCandleVolume(oneDayCandles)
    : initialValue;
  return (
    <Tooltip
      description={t(
        'The total number of contracts traded in the last 24 hours.'
      )}
    >
      <span ref={ref}>
        {candleVolume && isNumeric(positionDecimalPlaces)
          ? addDecimalsFormatNumber(
              candleVolume,
              positionDecimalPlaces,
              formatDecimals
            )
          : '-'}
      </span>
    </Tooltip>
  );
};
