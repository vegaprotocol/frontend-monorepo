import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import {
  AgGrid,
  PriceFlashCell,
  useDataGridEvents,
} from '@vegaprotocol/datagrid';
import type { MarketMaybeWithData } from '@vegaprotocol/markets';
import { useColumnDefs } from './use-column-defs';
import type { DataGridStore } from '../../stores/datagrid-store-slice';
import { type StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';

export const getRowId = ({ data }: { data: { id: string } }) => data.id;

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  filterParams: { buttons: ['reset'] },
};

const components = {
  PriceFlashCell,
};

type Props = TypedDataAgGrid<MarketMaybeWithData>;

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

const useMarketsStore = create<DataGridSlice>()(
  persist(createDataGridSlice, {
    name: 'vega_market_list_store',
  })
);

export const MarketListTable = (props: Props) => {
  const columnDefs = useColumnDefs();
  const gridStore = useMarketsStore((store) => store.gridStore);
  const updateGridStore = useMarketsStore((store) => store.updateGridStore);

  const gridStoreCallbacks = useDataGridEvents(gridStore, (colState) => {
    updateGridStore(colState);
  });

  return (
    <AgGrid
      getRowId={getRowId}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      components={components}
      rowHeight={45}
      {...gridStoreCallbacks}
      {...props}
    />
  );
};

export default MarketListTable;
