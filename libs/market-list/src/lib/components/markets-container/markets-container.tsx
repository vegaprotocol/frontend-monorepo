import { useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import type { IGetRowsParams, RowClickedEvent } from 'ag-grid-community';
import type {
  MarketList_markets,
  MarketList_markets_data,
} from '../../__generated__/MarketList';
import { marketsDataProvider as dataProvider } from '../../markets-data-provider';
import { Interval, MarketState } from '@vegaprotocol/types';

export const MarketsContainer = () => {
  const { push } = useRouter();
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<MarketList_markets[] | null>(null);

  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();
  const variables = useMemo(
    () => ({ interval: Interval.I1H, since: yTimestamp }),
    [yTimestamp]
  );

  const update = useCallback(({ data }: { data: MarketList_markets[] }) => {
    if (!gridRef.current?.api) {
      return false;
    }
    dataRef.current = data;
    gridRef.current.api.refreshInfiniteCache();
    return true;
  }, []);
  const { data, error, loading } = useDataProvider<
    MarketList_markets[],
    MarketList_markets_data
  >({ dataProvider, update, variables });
  dataRef.current = data;
  const getRows = async ({
    successCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current
          .slice(startRow, endRow)
          .filter((m) => m.data?.market.state !== MarketState.Rejected)
      : [];
    const lastRow = dataRef.current?.length ?? -1;
    successCallback(rowsThisBlock, lastRow);
  };
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <MarketListTable
        rowModelType="infinite"
        datasource={{ getRows }}
        ref={gridRef}
        onRowClicked={(rowEvent: RowClickedEvent) => {
          const { data, event } = rowEvent;
          // filters out clicks on the symbol column because it should display asset details
          if ((event?.target as HTMLElement).tagName.toUpperCase() === 'BUTTON')
            return;
          push(`/markets/${(data as MarketList_markets).id}`);
        }}
      />
    </AsyncRenderer>
  );
};
