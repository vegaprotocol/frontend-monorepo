import { useCallback, useMemo, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import {
  addDecimalsFormatNumber,
  t,
  useDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import type {
  SingleMarketFieldsFragment,
  Candle,
} from '@vegaprotocol/market-list';
import { calcCandleVolume } from '@vegaprotocol/market-list';
import {
  marketCandlesProvider,
  marketProvider,
} from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import * as constants from '../constants';

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
      interval: Interval.INTERVAL_I1H,
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
    ({ data }: { data: Candle[] }) => {
      throttledSetCandles(data);
      return true;
    },
    [throttledSetCandles]
  );

  useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    update,
    variables,
    skip: !marketId || !data,
    updateOnInit: true,
  });

  return (
    <HeaderStat heading={t('Volume (24h)')} testId="market-volume">
      {!error && candleVolume && data?.positionDecimalPlaces
        ? addDecimalsFormatNumber(candleVolume, data.positionDecimalPlaces)
        : '-'}
    </HeaderStat>
  );
};
