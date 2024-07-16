import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import { AgGrid, PriceFlashCell } from '@vegaprotocol/datagrid';
import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import { useMarketsColumnDefs } from './use-column-defs';
import type { DataGridStore } from '../../stores/datagrid-store-slice';
import { type StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ICellRendererParams } from 'ag-grid-community';
import { type ReactNode } from 'react';

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

const defaultColDef = {
  sortable: true,
  filter: false,
  resizable: true,
  filterParams: { buttons: ['reset'] },
  minWidth: 100,
};

const components = {
  PriceFlashCell,
};

type Props = TypedDataAgGrid<MarketMaybeWithData> & {
  filterSummary?: ReactNode;
};

export type DataGridSlice = {
  gridStore: DataGridStore;
  updateGridStore: (gridStore: DataGridStore) => void;
};

export const createDataGridSlice: StateCreator<DataGridSlice> = (set) => ({
  gridStore: {},
  updateGridStore: (newStore) => {
    set((curr) => ({
      gridStore: {
        ...curr.gridStore,
        ...newStore,
      },
    }));
  },
});

export const useMarketsStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_market_list_store',
  })
);

export const MarketListTable = ({ filterSummary, ...props }: Props) => {
  const columnDefs = useMarketsColumnDefs();

  return (
    <AgGrid
      getRowId={getRowId}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      components={components}
      rowHeight={60}
      rowClass={
        '!border-b !last:border-b-0 mb-1 border-vega-clight-600 dark:border-vega-cdark-600'
      }
      headerHeight={40}
      domLayout="autoHeight"
      autoSizeStrategy={{
        type: 'fitGridWidth',
      }}
      isFullWidthRow={(params) => {
        const data = params.rowNode.data;
        return isFilterSummaryRow(data);
      }}
      fullWidthCellRenderer={FullWidthCellRenderer}
      getRowHeight={(params) => {
        const data = params.data;
        if (isFilterSummaryRow(data)) {
          return 30;
        }
        return 60;
      }}
      pinnedTopRowData={
        filterSummary
          ? [
              {
                id: 'summary',
                filterSummary,
              },
            ]
          : []
      }
      {...props}
    />
  );
};

const isFilterSummaryRow = (data: unknown) =>
  Boolean(data && typeof data === 'object' && 'filterSummary' in data);

const FullWidthCellRenderer = ({ data }: ICellRendererParams) => {
  if (isFilterSummaryRow(data)) {
    return <div>{data.filterSummary}</div>;
  }
  return null;
};

export default MarketListTable;
