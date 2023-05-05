import type { MutableRefObject } from 'react';
import { useCallback } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Column } from 'ag-grid-community';
import debounce from 'lodash/debounce';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const STORAGE_KEY = 'vega_columns_sizes_store';
const COLUMNS_SET_DEBOUNCE_TIME = 300;

export const useColumnSizesStore = create<{
  sizes: Record<string, Record<string, number>>;
  valueSetter: (storeKey: string, value: Record<string, number>) => void;
}>()(
  persist(
    immer((set) => ({
      sizes: {},
      valueSetter: (storeKey, value) =>
        set((state) => {
          state.sizes[storeKey] = {
            ...(state.sizes[storeKey] || {}),
            ...value,
          };
          return state;
        }),
    })),
    { name: STORAGE_KEY }
  )
);

interface UseColumnSizesProps {
  storeKey?: string;
  container?: MutableRefObject<HTMLDivElement | null>;
}
export const useColumnSizes = ({
  storeKey = '',
  container,
}: UseColumnSizesProps): [
  Record<string, number>,
  (columns: Column[]) => void,
  (gridRef?: MutableRefObject<AgGridReact>) => void
] => {
  const sizes = useColumnSizesStore((store) => store.sizes[storeKey] || {});
  const valueSetter = useColumnSizesStore((store) => store.valueSetter);
  const getWidthOfAll = useCallback(
    () =>
      (container?.current as HTMLDivElement)?.getBoundingClientRect().width ??
      0,
    [container]
  );
  const recalculateSizes = useCallback(
    (sizes: Record<string, number>) => {
      const width = getWidthOfAll();
      if (width && sizes['width'] && width !== sizes['width']) {
        const oldWidth = sizes['width'];
        const ratio = width / oldWidth;
        return {
          ...Object.entries(sizes).reduce((agg, [key, value]) => {
            agg[key] = value * ratio;
            return agg;
          }, {} as Record<string, number>),
          width,
        } as Record<string, number>;
      }
      return sizes;
    },
    [getWidthOfAll]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOnChange = useCallback(
    debounce((columns: Column[]) => {
      if (storeKey && columns.length) {
        const sizesObj = columns.reduce((aggr, column) => {
          aggr[column.getColId()] = column.getActualWidth();
          return aggr;
        }, {} as Record<string, number>);
        sizesObj['width'] = getWidthOfAll();
        valueSetter(storeKey, sizesObj);
      }
    }, COLUMNS_SET_DEBOUNCE_TIME),
    [valueSetter, storeKey]
  );
  const onResize = useCallback(
    (gridRef?: MutableRefObject<AgGridReact>) => {
      if (storeKey && gridRef?.current) {
        const recalulated = recalculateSizes(sizes);
        const newSizes = Object.entries(recalulated).map(([key, size]) => ({
          key,
          newWidth: size,
        }));
        gridRef.current.columnApi.setColumnWidths(newSizes);
      }
    },
    [storeKey, recalculateSizes, sizes]
  );

  return [recalculateSizes(sizes), handleOnChange, onResize];
};
