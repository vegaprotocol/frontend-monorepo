import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subDays } from 'date-fns';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import type { MarketState } from '@vegaprotocol/types';
import useMarketsFilterData from '../../hooks/use-markets-filter-data';
import useColumnDefinitions from '../../hooks/use-column-definitions';
import dataProvider from './data-provider';
import * as constants from './constants';
import SimpleMarketToolbar from './simple-market-toolbar';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';
import type { SimpleMarketDataSub_marketData } from './__generated__/SimpleMarketDataSub';
export type SimpleMarketsType = SimpleMarkets_markets & {
  percentChange?: number | '-';
};

export type RouterParams = Partial<{
  product: string;
  asset: string;
  state: string;
}>;

const SimpleMarketList = () => {
  const navigate = useNavigate();
  const params = useParams<RouterParams>();
  const theme = useContext(ThemeContext);
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
    gridRef.current?.api.sizeColumnsToFit();
  }, [gridRef]);

  useEffect(() => {
    const statuses: Record<string, MarketState | ''> = {};
    data?.forEach((market) => {
      statuses[market.id] = market.data?.market.state || '';
    });
    statusesRef.current = statuses;
  }, [data, statusesRef]);

  useEffect(() => {
    window.addEventListener('resize', handleOnGridReady);
    return () => window.removeEventListener('resize', handleOnGridReady);
  }, [handleOnGridReady]);

  const onClick = useCallback(
    (marketId) => {
      navigate(`/trading/${marketId}`);
    },
    [navigate]
  );

  const { columnDefs, defaultColDef } = useColumnDefinitions({ onClick });

  const getRowId = useCallback(({ data }) => data.id, []);

  return (
    <div className="h-full grid grid-rows-[min-content,1fr]">
      <SimpleMarketToolbar />
      <AsyncRenderer loading={loading} error={error} data={localData}>
        <AgGrid
          className="mb-32 min-h-[300px]"
          defaultColDef={defaultColDef}
          columnDefs={columnDefs}
          rowData={localData}
          rowHeight={60}
          customThemeParams={
            theme === 'dark'
              ? constants.agGridDarkVariables
              : constants.agGridLightVariables
          }
          onGridReady={handleOnGridReady}
          ref={gridRef}
          overlayNoRowsTemplate={t('No data to display')}
          suppressContextMenu
          getRowId={getRowId}
          suppressMovableColumns
        />
      </AsyncRenderer>
    </div>
  );
};

export default SimpleMarketList;
