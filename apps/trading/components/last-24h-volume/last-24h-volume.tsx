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

export const Last24hVolume = ({
  marketId,
  noUpdate = false,
  isHeader = true,
  initialValue,
}: {
  marketId?: string;
  noUpdate?: boolean;
  isHeader?: boolean;
  initialValue?: string;
}) => {
  const [candleVolume, setCandleVolume] = useState<string>(initialValue || '');
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

  useDataProvider<Candle[], Candle>({
    dataProvider: marketCandlesProvider,
    update,
    variables,
    skip: noUpdate || !marketId || !data,
  });

  const formatDecimals = isHeader ? data?.positionDecimalPlaces || 0 : 2;
  const content =
    !error && candleVolume && data?.positionDecimalPlaces
      ? addDecimalsFormatNumber(
          candleVolume,
          data.positionDecimalPlaces,
          formatDecimals
        )
      : '-';

  return isHeader ? (
    <HeaderStat
      heading={t('Volume (24h)')}
      testId="market-volume"
      description={
        error && candleVolume && data?.positionDecimalPlaces
          ? t('The total amount of assets traded in the last 24 hours.')
          : null
      }
    >
      {content}
    </HeaderStat>
  ) : (
    <>{content}</>
  );
};
