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
} from '@vegaprotocol/market-list';
import { marketDataProvider } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import * as constants from '../constants';

interface Props {
  marketId?: string;
  decimalPlaces?: number;
  isHeader?: boolean;
  noUpdate?: boolean;
  initialValue?: string;
}

export const MarketMarkPrice = ({
  marketId,
  decimalPlaces,
  initialValue,
  isHeader = false,
  noUpdate = false,
}: Props) => {
  const [marketPrice, setMarketPrice] = useState<string | null>(
    initialValue || null
  );
  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

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
    skip: noUpdate || !marketId,
  });

  const content = useMemo(() => {
    if (!marketPrice || !decimalPlaces) {
      return <>-</>;
    }
    return isHeader ? (
      <div>{addDecimalsFormatNumber(marketPrice, decimalPlaces)}</div>
    ) : (
      <PriceCell
        value={Number(marketPrice)}
        valueFormatted={addDecimalsFormatNumber(marketPrice, decimalPlaces, 2)}
      />
    );
  }, [marketPrice, decimalPlaces, isHeader]);

  return isHeader ? (
    <HeaderStat heading={t('Price')} testId="market-price">
      {content}
    </HeaderStat>
  ) : (
    content
  );
};
