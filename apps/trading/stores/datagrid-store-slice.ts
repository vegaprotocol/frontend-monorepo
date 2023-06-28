import type { ColumnState } from 'ag-grid-community';
import type { StateCreator } from 'zustand';

export type DataGridStore = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterModel?: { [key: string]: any };
  columnState?: ColumnState[];
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
