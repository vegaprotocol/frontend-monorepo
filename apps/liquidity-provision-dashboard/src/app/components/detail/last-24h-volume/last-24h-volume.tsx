import { useState, useMemo, useRef, useCallback } from 'react';
import throttle from 'lodash/throttle';
import {
  useYesterday,
  useDataProvider,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  calcDayVolume,
  getChange,
  displayChange,
} from '@vegaprotocol/liquidity';

import type { Candle } from '@vegaprotocol/market-list';
import { marketCandlesProvider } from '@vegaprotocol/market-list';

const THROTTLE_UPDATE_TIME = 500;

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
      interval: Schema.Interval.INTERVAL_I1H,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const variables24hAgo = useMemo(
    () => ({
      marketId: marketId,
      interval: Schema.Interval.INTERVAL_I1D,
      since: yTimestamp,
    }),
    [marketId, yTimestamp]
  );

  const throttledSetCandles = useRef(
    throttle((data: Candle[]) => {
      setCandleVolume(calcDayVolume(data));
    }, THROTTLE_UPDATE_TIME)
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
    }, THROTTLE_UPDATE_TIME)
  ).current;

  const updateCandle24hAgo = useCallback(
    ({ data }: { data: Candle[] | null }) => {
      if (data) {
        throttledSetVolumeChange(data);
      }
      return true;
    },
    [throttledSetVolumeChange]
  );

  useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    update: updateCandle24hAgo,
    variables: variables24hAgo,
    skip: !marketId || !data,
  });

  return (
    <div>
      <span className="text-3xl">
        {!error && candleVolume
          ? addDecimalsFormatNumber(candleVolume, decimals)
          : '0'}{' '}
      </span>
      <span className="text-lg text-greys-light-400">
        ({displayChange(volumeChange)})
      </span>
    </div>
  );
};
