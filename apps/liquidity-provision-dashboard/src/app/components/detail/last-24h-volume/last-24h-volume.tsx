import { useState, useMemo, useRef, useCallback } from 'react';
import throttle from 'lodash/throttle';
import {
  useYesterday,
  useDataProvider,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { Interval } from '@vegaprotocol/types';
import {
  calcDayVolume,
  getChange,
  displayChange,
} from '@vegaprotocol/liquidity';

import type { Candle } from '@vegaprotocol/market-list';
import { marketCandlesProvider } from '@vegaprotocol/market-list';

const DEBOUNCE_UPDATE_TIME = 500;

export const Last24hVolume = ({
  marketId,
  decimals,
}: {
  marketId: string;
  decimals: number;
}) => {
  const [candleVolume, setCandleVolume] = useState<string>();
  const [volumeChange, setVolumeChange] = useState<string>(' - ');

  const yesterday = useYesterday();

  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);

  const variables = useMemo(
    () => ({
      marketId: marketId,
      interval: Interval.INTERVAL_I1H,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const variables24hAgo = useMemo(
    () => ({
      marketId: marketId,
      interval: Interval.INTERVAL_I1D,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const throttledSetCandles = useRef(
    throttle((data: Candle[]) => {
      setCandleVolume(calcDayVolume(data));
    }, DEBOUNCE_UPDATE_TIME)
  ).current;

  const update = useCallback(
    ({ data }: { data: Candle[] }) => {
      throttledSetCandles(data);
      return true;
    },
    [throttledSetCandles]
  );

  const { data, error } = useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    variables: variables,
    update,
    skip: !marketId,
  });

  const throttledSetVolumeChange = useRef(
    throttle((candles: Candle[]) => {
      const candle24hAgo = candles?.[0];
      setVolumeChange(getChange(data || [], candle24hAgo?.close));
    }, DEBOUNCE_UPDATE_TIME)
  ).current;

  const updateCandle24hAgo = useCallback(
    ({ data }: { data: Candle[] }) => {
      throttledSetVolumeChange(data);
      return true;
    },
    [throttledSetVolumeChange]
  );

  useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    update: updateCandle24hAgo,
    variables: variables24hAgo,
    skip: !marketId || !data,
    updateOnInit: true,
  });

  return (
    <div>
      {!error && candleVolume
        ? addDecimalsFormatNumber(candleVolume, decimals)
        : '0'}{' '}
      ({displayChange(volumeChange)})
    </div>
  );
};
