import { useCallback, useMemo, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { t, useDataProvider, useYesterday } from '@vegaprotocol/react-helpers';
import { PriceCellChange } from '@vegaprotocol/ui-toolkit';
import { Interval } from '@vegaprotocol/types';
import type { CandleClose } from '@vegaprotocol/types';
import type {
  SingleMarketFieldsFragment,
  Candle,
} from '@vegaprotocol/market-list';
import {
  marketCandlesProvider,
  marketProvider,
} from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import * as constants from '../constants';

export const Last24hPriceChange = ({ marketId }: { marketId: string }) => {
  const [candlesClose, setCandlesClose] = useState<string[]>([]);
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
      const candlesClose: string[] = data
        .map((candle) => candle?.close)
        .filter((c): c is CandleClose => c !== null);
      setCandlesClose(candlesClose);
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
    updateOnInit: true,
  });

  return (
    <HeaderStat heading={t('Change (24h)')} testId="market-change">
      {!error && data?.decimalPlaces ? (
        <PriceCellChange
          candles={candlesClose}
          decimalPlaces={data.decimalPlaces}
        />
      ) : (
        '-'
      )}
    </HeaderStat>
  );
};
