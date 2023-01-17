import { useCallback, useMemo, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import {
  addDecimalsFormatNumber,
  t,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import type {
  MarketData,
  MarketDataUpdateFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import * as constants from '../constants';

export const MarketVolume = ({ marketId }: { marketId: string }) => {
  const [marketVolume, setMarketVolume] = useState<string>('-');
  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );
  const { data } = useDataProvider<SingleMarketFieldsFragment, never>({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const throttledSetMarketVolume = useRef(
    throttle((volume: string) => {
      setMarketVolume(volume);
    }, constants.THROTTLE_UPDATE_TIME)
  ).current;
  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      throttledSetMarketVolume(
        marketData?.indicativeVolume &&
          data?.positionDecimalPlaces !== undefined
          ? addDecimalsFormatNumber(
              marketData.indicativeVolume,
              data.positionDecimalPlaces
            )
          : '-'
      );
      return true;
    },
    [data?.positionDecimalPlaces, throttledSetMarketVolume]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: !marketId || !data,
  });

  return (
    <HeaderStat heading={t('Volume')} testId="market-volume">
      <div>{marketVolume}</div>
    </HeaderStat>
  );
};
