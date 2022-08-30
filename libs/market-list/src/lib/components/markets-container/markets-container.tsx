import { useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable, getRowId } from './market-list-table';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import type { RowClickedEvent } from 'ag-grid-community';
import { produce } from 'immer';
import merge from 'lodash/merge';
import type {
  MarketList_markets,
  MarketList_markets_data,
  MarketDataSub_marketData,
} from '../../__generated__';
import { marketsDataProvider as dataProvider } from '../../markets-data-provider';
import { Interval, MarketState } from '@vegaprotocol/types';

export const MarketsContainer = () => {
  const { push } = useRouter();
  const gridRef = useRef<AgGridReact | null>(null);

  const yTimestamp = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);
  const variables = useMemo(
    () => ({ interval: Interval.INTERVAL_I1H, since: yTimestamp }),
    [yTimestamp]
  );

  const update = useCallback(
    ({ delta }: { delta: MarketDataSub_marketData }) => {
      const update: MarketList_markets[] = [];
      const add: MarketList_markets[] = [];
      const remove: MarketList_markets[] = [];
      if (!gridRef.current?.api) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(
        getRowId({ data: delta.market })
      );
      if (rowNode) {
        const updatedData = produce<MarketList_markets>(
          rowNode.data.data,
          (draft: MarketList_markets) => merge(draft, delta)
        );
        if (updatedData !== rowNode.data.data) {
          update.push({ ...rowNode.data, data: updatedData });
        }
      }
      // @TODO - else add new market
      if (update.length || add.length || remove.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
      }
      return true;
    },
    [gridRef]
  );

  const { data, error, loading } = useDataProvider<
    MarketList_markets[],
    MarketList_markets_data
  >({ dataProvider, update, variables });

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <MarketListTable
        rowData={
          data &&
          data.filter(
            (m) => m.data?.market.state !== MarketState.STATE_REJECTED
          )
        }
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
