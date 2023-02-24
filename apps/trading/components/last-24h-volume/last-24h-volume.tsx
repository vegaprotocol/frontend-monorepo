import type { RefObject } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  calcCandleVolume,
  marketCandlesProvider,
} from '@vegaprotocol/market-list';
import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import {
  useThrottledDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { useMemo } from 'react';
import type { Candle } from '@vegaprotocol/market-list';
import { THROTTLE_UPDATE_TIME } from '../constants';

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

  const variables = useMemo(
    () => ({
      marketId: marketId,
      interval: Schema.Interval.INTERVAL_I1H,
      since: new Date(yesterday).toISOString(),
    }),
    [marketId, yesterday]
  );

  const { data } = useThrottledDataProvider<Candle[], Candle>(
    {
      dataProvider: marketCandlesProvider,
      variables,
      skip: !(inView && marketId),
    },
    THROTTLE_UPDATE_TIME
  );
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
