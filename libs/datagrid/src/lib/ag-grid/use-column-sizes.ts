import { useCallback } from 'react';
import type { Column } from 'ag-grid-community';
import debounce from 'lodash/debounce';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const STORAGE_KEY = 'vega_columns_sizes_store';
const COLUMNS_SET_DEBOUNCE_TIME = 300;

export const useColumnSizesStore = create<{
  sizes: Record<string, Record<string, string>>;
  valueSetter: (id: string, value: Record<string, string>) => void;
}>()(
  persist(
    immer((set) => ({
      sizes: {},
      valueSetter: (id, value) =>
        set((state) => {
          state.sizes[id] = {
            ...(state.sizes[id] || {}),
            ...value,
          };
          return state;
        }),
    })),
    { name: STORAGE_KEY }
  )
);

interface UseColumnSizesProps {
  id: string;
}
export const useColumnSizes = ({
  id,
}: UseColumnSizesProps): [
  Record<string, string>,
  (columns: Column[]) => void
] => {
  const sizes = useColumnSizesStore((store) => store.sizes[id]) || {};
  const valueSetter = useColumnSizesStore((store) => store.valueSetter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOnChange = useCallback(
    debounce((columns: Column[]) => {
      if (id && columns.length) {
        const sizesObj = columns.reduce((aggr, column) => {
          aggr[column.getColId()] = column.getActualWidth();
          return aggr;
        }, {});
        valueSetter(id, sizesObj);
      }
    }, COLUMNS_SET_DEBOUNCE_TIME),
    [valueSetter, id]
  );
  return [sizes, handleOnChange];
};
