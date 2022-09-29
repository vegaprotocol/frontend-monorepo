import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AgGridReact } from 'ag-grid-react';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { MarketState } from '@vegaprotocol/types';
import useMarketsFilterData from './use-markets-filter-data';
import useColumnDefinitions from './use-column-definitions';
import SimpleMarketToolbar from './simple-market-toolbar';
import { IS_MARKET_TRADABLE } from '../../constants';
import { ConsoleLiteGrid } from '../console-lite-grid';
import type { Market } from '@vegaprotocol/market-list';
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
  const { isMobile } = useScreenDimensions();
  const navigate = useNavigate();
  const params = useParams<RouterParams>();
  const statusesRef = useRef<Record<string, MarketState | ''>>({});
  const gridRef = useRef<AgGridReact | null>(null);

  const { data, error, loading } = useMarketList();
  const localData = useMarketsFilterData(data, params);

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
    ({ data }: { data: Market }) => {
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
        <ConsoleLiteGrid<MarketWithPercentChange>
          classNamesParam="mb-32 min-h-[300px]"
          columnDefs={columnDefs}
          rowData={localData}
          defaultColDef={defaultColDef}
          handleRowClicked={handleRowClicked}
        />
      </AsyncRenderer>
    </div>
  );
};

export default SimpleMarketList;
