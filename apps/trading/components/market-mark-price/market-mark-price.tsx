import { useCallback, useMemo, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import {
  addDecimalsFormatNumber,
  t,
  PriceCell,
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

export const MarketMarkPrice = ({
  marketId,
  initialValue,
  isHeader = true,
  noUpdate = false,
}: {
  marketId?: string;
  isHeader?: boolean;
  noUpdate?: boolean;
  initialValue?: string;
}) => {
  const [marketPrice, setMarketPrice] = useState<string | null>(
    initialValue || null
  );
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
      noUpdate || setMarketPrice(price);
    }, constants.DEBOUNCE_UPDATE_TIME)
  ).current;
  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      throttledSetMarketPrice(marketData?.markPrice || '');
      return true;
    },
    [throttledSetMarketPrice]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: noUpdate || !marketId || !data,
  });

  const content = useMemo(() => {
    if (!marketPrice || !data?.decimalPlaces) {
      return <>-</>;
    }
    return isHeader ? (
      <div>{addDecimalsFormatNumber(marketPrice, data.decimalPlaces)}</div>
    ) : (
      <PriceCell
        value={Number(marketPrice)}
        valueFormatted={addDecimalsFormatNumber(
          marketPrice || '',
          data?.decimalPlaces || 0,
          2
        )}
      />
    );
  }, [marketPrice, data?.decimalPlaces, isHeader]);

  return isHeader ? (
    <HeaderStat heading={t('Price')} testId="market-price">
      {content}
    </HeaderStat>
  ) : (
    content
  );
};
