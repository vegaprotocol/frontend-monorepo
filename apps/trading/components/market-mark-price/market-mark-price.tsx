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

export const MarketMarkPrice = ({ marketId }: { marketId?: string }) => {
  const [marketPrice, setMarketPrice] = useState<string | null>(null);
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
  const throttledSetMarketPrice = useRef(
    throttle((price: string) => {
      setMarketPrice(price);
    }, constants.DEBOUNCE_UPDATE_TIME)
  ).current;
  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      throttledSetMarketPrice(
        marketData?.markPrice && data?.decimalPlaces
          ? addDecimalsFormatNumber(marketData.markPrice, data.decimalPlaces)
          : '-'
      );
      return true;
    },
    [data?.decimalPlaces, throttledSetMarketPrice]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: !marketId || !data,
  });

  return (
    <HeaderStat heading={t('Price')} testId="market-price">
      <div>{marketPrice}</div>
    </HeaderStat>
  );
};
