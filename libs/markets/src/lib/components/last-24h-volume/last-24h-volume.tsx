import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { calcCandleVolume } from '../../market-utils';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useCandles } from '../../hooks';

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
  const [ref, inView] = useInView({ root: inViewRoot?.current });
  const { oneDayCandles, fiveDaysCandles } = useCandles({
    marketId,
    inView,
  });

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
        <span ref={ref}>-</span>
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
