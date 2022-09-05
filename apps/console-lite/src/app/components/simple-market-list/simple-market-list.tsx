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
import {
  useDataProvider,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
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
import { IS_MARKET_TRADABLE } from '../../constants';
import type {
  CellKeyDownEvent,
  FullWidthCellKeyDownEvent,
} from 'ag-grid-community/dist/lib/events';
import type {
  GetRowIdParams,
  TabToNextCellParams,
} from 'ag-grid-community/dist/lib/entities/iCallbackParams';

export type SimpleMarketsType = SimpleMarkets_markets & {
  percentChange?: number | '-';
};

export type RouterParams = Partial<{
  product: string;
  asset: string;
  state: string;
}>;

const SimpleMarketList = () => {
  const { isMobile, screenSize } = useScreenDimensions();
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

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.id, []);

  const handleRowClicked = useCallback(
    ({ data }: { data: SimpleMarketsType }) => {
      if (IS_MARKET_TRADABLE(data)) {
        navigate(`/trading/${data.id}`);
      }
    },
    [navigate]
  );

  const onTabToNextCell = useCallback((params: TabToNextCellParams) => {
    const {
      api,
      previousCellPosition: { rowIndex },
    } = params;
    const rowCount = api.getDisplayedRowCount();
    if (rowCount <= rowIndex + 1) {
      return null;
    }
    return { ...params.previousCellPosition, rowIndex: rowIndex + 1 };
  }, []);

  const onCellKeyDown = useCallback(
    (
      params: (CellKeyDownEvent | FullWidthCellKeyDownEvent) & {
        event: KeyboardEvent;
      }
    ) => {
      const { event: { key = '' } = {}, data } = params;
      if (key === 'Enter') {
        handleRowClicked({ data });
      }
    },
    [handleRowClicked]
  );

  const shouldSuppressHorizontalScroll = useMemo(() => {
    return !isMobile && constants.LARGE_SCREENS.includes(screenSize);
  }, [isMobile, screenSize]);

  return (
    <div className="h-full p-4 md:p-6 grid grid-rows-[min-content,1fr]">
      <SimpleMarketToolbar data={data || []} />
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
          onRowClicked={handleRowClicked}
          rowClass={isMobile ? 'mobile' : ''}
          rowClassRules={constants.ROW_CLASS_RULES}
          ref={gridRef}
          overlayNoRowsTemplate={t('No data to display')}
          suppressContextMenu
          getRowId={getRowId}
          suppressMovableColumns
          suppressRowTransform
          onCellKeyDown={onCellKeyDown}
          tabToNextCell={onTabToNextCell}
          suppressHorizontalScroll={shouldSuppressHorizontalScroll}
        />
      </AsyncRenderer>
    </div>
  );
};

export default SimpleMarketList;
