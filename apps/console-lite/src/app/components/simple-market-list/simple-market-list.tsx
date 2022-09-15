import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subDays } from 'date-fns';
import type { AgGridReact } from 'ag-grid-react';
import {
  useDataProvider,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { MarketState } from '@vegaprotocol/types';
import useMarketsFilterData from '../../hooks/use-markets-filter-data';
import useColumnDefinitions from '../../hooks/use-column-definitions';
import dataProvider from './data-provider';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import type { SimpleMarketDataSub_marketData } from './__generated__/SimpleMarketDataSub';
import { IS_MARKET_TRADABLE } from '../../constants';
import { ConsoleLiteGrid } from '../console-lite-grid';

export type SimpleMarketsType = SimpleMarkets_markets & {
  percentChange?: number | '-';
};

export type RouterParams = Partial<{
  product: string;
  asset: string;
  state: string;
}>;

const SimpleMarketList = () => {
  const { isMobile } = useScreenDimensions();
  const navigate = useNavigate();
  const params = useParams<RouterParams>();
  const statusesRef = useRef<Record<string, MarketState | ''>>({});
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(
    () => ({
      CandleSince: subDays(Date.now(), 1).toJSON(),
    }),
    []
  );
  const update = useCallback(
    ({ delta }: { delta: SimpleMarketDataSub_marketData }) =>
      statusesRef.current[delta.market.id] === delta.market.state,
    [statusesRef]
  );

  const { data, error, loading } = useDataProvider({
    dataProvider,
    update,
    variables,
  });
  const localData: Array<SimpleMarketsType> = useMarketsFilterData(
    data || [],
    params
  );

  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);

  useEffect(() => {
    const statuses: Record<string, MarketState | ''> = {};
    data?.forEach((market) => {
      statuses[market.id] = market.state || '';
    });
    statusesRef.current = statuses;
  }, [data, statusesRef]);

  useEffect(() => {
    window.addEventListener('resize', handleOnGridReady);
    return () => window.removeEventListener('resize', handleOnGridReady);
  }, [handleOnGridReady]);

  const { columnDefs, defaultColDef } = useColumnDefinitions({ isMobile });

  const handleRowClicked = useCallback(
    ({ data }: { data: SimpleMarketsType }) => {
      if (IS_MARKET_TRADABLE(data)) {
        navigate(`/trading/${data.id}`);
      }
    },
    [navigate]
  );

  return (
    <div className="h-full p-4 md:p-6 grid grid-rows-[min-content,1fr]">
      <SimpleMarketToolbar data={data || []} />
      <AsyncRenderer loading={loading} error={error} data={localData}>
        <ConsoleLiteGrid<SimpleMarketsType>
          classNamesParam="mb-32 min-h-[300px]"
          columnDefs={columnDefs}
          data={localData}
          defaultColDef={defaultColDef}
          handleRowClicked={handleRowClicked}
        />
      </AsyncRenderer>
    </div>
  );
};

export default SimpleMarketList;
