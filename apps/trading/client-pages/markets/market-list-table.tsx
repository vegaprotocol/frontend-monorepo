import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import { AgGrid, PriceFlashCell } from '@vegaprotocol/datagrid';
import { useMarketsColumnDefs } from './use-column-defs';
import type { DataGridStore } from '../../stores/datagrid-store-slice';
import { type StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Market } from '../../lib/hooks/use-markets';

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  filterParams: { buttons: ['reset'] },
  minWidth: 100,
};

const components = {
  PriceFlashCell,
};

type Props = TypedDataAgGrid<Market>;

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

export const MarketListTable = (props: Props) => {
  const columnDefs = useMarketsColumnDefs();

  return (
    <AgGrid
      getRowId={getRowId}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      components={components}
      rowHeight={60}
      headerHeight={40}
      domLayout="autoHeight"
      autoSizeStrategy={{
        type: 'fitGridWidth',
      }}
      {...props}
    />
  );
};

export default MarketListTable;
