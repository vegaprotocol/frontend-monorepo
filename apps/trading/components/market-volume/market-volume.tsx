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

  const update = useCallback(
    debounce(
      ({ data: marketData }: { data: MarketData }) => {
        setMarketVolume(
          marketData.indicativeVolume &&
            data?.positionDecimalPlaces !== undefined
            ? addDecimalsFormatNumber(
                marketData.indicativeVolume,
                data.positionDecimalPlaces
              )
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
    <HeaderStat heading={t('Volume')}>
      <div data-testid="trading-volume">{marketVolume}</div>
    </HeaderStat>
  );
};
