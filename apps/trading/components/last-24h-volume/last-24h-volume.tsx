import {
  calcCandleVolume,
  marketCandlesProvider,
  marketProvider,
} from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  t,
  useDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import throttle from 'lodash/throttle';
import { useCallback, useMemo, useRef, useState } from 'react';

import * as constants from '../constants';
import { HeaderStat } from '../header';

import type {
  SingleMarketFieldsFragment,
  Candle,
} from '@vegaprotocol/market-list';
export const Last24hVolume = ({ marketId }: { marketId: string }) => {
  const [candleVolume, setCandleVolume] = useState<string>();
  const yesterday = useYesterday();
  // Cache timestamp for yesterday to prevent full unmount of market page when
  // a rerender occurs
  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);

  const marketVariables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  const variables = useMemo(
    () => ({
      marketId: marketId,
      interval: Schema.Interval.INTERVAL_I1H,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const { data, error } = useDataProvider<SingleMarketFieldsFragment, never>({
    dataProvider: marketProvider,
    variables: marketVariables,
    skip: !marketId,
  });

  const throttledSetCandles = useRef(
    throttle((data: Candle[]) => {
      setCandleVolume(calcCandleVolume(data));
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

  useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    update,
    variables,
    skip: !marketId || !data,
  });

  return (
    <HeaderStat
      heading={t('Volume (24h)')}
      testId="market-volume"
      description={
        error && candleVolume && data?.positionDecimalPlaces
          ? t('The total amount of assets traded in the last 24 hours.')
          : null
      }
    >
      {!error && candleVolume && data?.positionDecimalPlaces
        ? addDecimalsFormatNumber(candleVolume, data.positionDecimalPlaces)
        : '-'}
    </HeaderStat>
  );
};
