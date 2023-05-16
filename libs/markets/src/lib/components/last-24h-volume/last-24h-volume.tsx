import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import { marketCandlesProvider } from '../../market-candles-provider';
import { calcCandleVolume } from '../../market-utils';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { useYesterday } from '@vegaprotocol/react-helpers';
import { useThrottledDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';

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
  const [ref, inView] = useInView({ root: inViewRoot?.current });

  const { data } = useThrottledDataProvider({
    dataProvider: marketCandlesProvider,
    variables: {
      marketId: marketId || '',
      interval: Schema.Interval.INTERVAL_I1H,
      since: new Date(yesterday).toISOString(),
    },
    skip: !(inView && marketId),
  });
  const candleVolume = data ? calcCandleVolume(data) : initialValue;
  return (
    <span ref={ref}>
      {candleVolume && isNumeric(positionDecimalPlaces)
        ? addDecimalsFormatNumber(
            candleVolume,
            positionDecimalPlaces,
            formatDecimals
          )
        : '-'}
    </span>
  );
};
