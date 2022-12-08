import {
  calcCandleVolume,
  marketCandlesProvider,
} from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  t,
  useDataProvider,
  useYesterday,
  isNumeric,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import throttle from 'lodash/throttle';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as constants from '../constants';
import { HeaderStat } from '../header';
import type { Candle } from '@vegaprotocol/market-list';

interface Props {
  marketId?: string;
  positionDecimalPlaces?: number;
  noUpdate?: boolean;
  isHeader?: boolean;
  initialValue?: string;
}

export const Last24hVolume = ({
  marketId,
  positionDecimalPlaces,
  noUpdate = false,
  isHeader = false,
  initialValue,
}: Props) => {
  const [candleVolume, setCandleVolume] = useState<string>(initialValue || '');
  const yesterday = useYesterday();
  // Cache timestamp for yesterday to prevent full unmount of market page when
  // a rerender occurs
  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);

  const variables = useMemo(
    () => ({
      marketId: marketId,
      interval: Schema.Interval.INTERVAL_I1H,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const throttledSetCandles = useRef(
    throttle((data: Candle[]) => {
      noUpdate || setCandleVolume(calcCandleVolume(data) || '');
    }, constants.DEBOUNCE_UPDATE_TIME)
  ).current;
  const update = useCallback(
    ({ data }: { data: Candle[] | null }) => {
      if (data) {
        throttledSetCandles(data);
      }
      return true;
    },
    [throttledSetCandles]
  );

  const { error } = useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    update,
    variables,
    skip: noUpdate || !marketId,
  });

  const formatDecimals = isHeader ? positionDecimalPlaces || 0 : 2;
  const content = useMemo(() => {
    return (
      <>
        {!error && candleVolume && isNumeric(positionDecimalPlaces)
          ? addDecimalsFormatNumber(
              candleVolume,
              positionDecimalPlaces,
              formatDecimals
            )
          : '-'}
      </>
    );
  }, [error, candleVolume, positionDecimalPlaces, formatDecimals]);
  return isHeader ? (
    <HeaderStat
      heading={t('Volume (24h)')}
      testId="market-volume"
      description={
        error && candleVolume && positionDecimalPlaces
          ? t('The total amount of assets traded in the last 24 hours.')
          : null
      }
    >
      {content}
    </HeaderStat>
  ) : (
    content
  );
};
