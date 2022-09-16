import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import type { MarketState } from '@vegaprotocol/types';
import useMarketsFilterData from '../../hooks/use-markets-filter-data';
import useColumnDefinitions from '../../hooks/use-column-definitions';
import * as constants from './constants';
import SimpleMarketToolbar from './simple-market-toolbar';
import { IS_MARKET_TRADABLE } from '../../constants';
import type {
  CellKeyDownEvent,
  FullWidthCellKeyDownEvent,
} from 'ag-grid-community/dist/lib/events';
import type {
  GetRowIdParams,
  TabToNextCellParams,
} from 'ag-grid-community/dist/lib/entities/iCallbackParams';
import type { Market, MarketsListData } from '@vegaprotocol/market-list';
import { useMarketList } from '@vegaprotocol/market-list';

export type MarketWithPercentChange = Market & {
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

  const { data, error, loading } = useMarketList();
  const localData = useMarketsFilterData(data as MarketsListData, params);

  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);

  useEffect(() => {
    const statuses: Record<string, MarketState | ''> = {};
    data?.markets?.forEach((market) => {
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
    ({ data }: { data: Market }) => {
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
      <SimpleMarketToolbar data={data?.markets || []} />
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
