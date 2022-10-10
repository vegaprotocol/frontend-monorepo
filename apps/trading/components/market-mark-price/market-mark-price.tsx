import { useCallback, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
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

export const MarketMarkPrice = ({ marketId }: { marketId: string }) => {
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

  const update = useCallback(
    debounce(
      ({ data: marketData }: { data: MarketData }) => {
        setMarketPrice(
          marketData.markPrice && data?.decimalPlaces
            ? addDecimalsFormatNumber(marketData.markPrice, data.decimalPlaces)
            : '-'
        );
        return true;
      },
      constants.DEBOUNCE_UPDATE_TIME,
      { leading: true, maxWait: 500 }
    ),
    [data]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: !marketId || !data,
    updateOnInit: true,
  });

  return (
    <HeaderStat heading={t('Price')}>
      <div data-testid="mark-price">{marketPrice}</div>
    </HeaderStat>
  );
};
