import type { MutableRefObject, ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type {
  Column,
  ColDef,
  ColumnResizedEvent,
  GridReadyEvent,
} from 'ag-grid-community';
import debounce from 'lodash/debounce';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useResizeObserver } from '@vegaprotocol/react-helpers';

const STORAGE_KEY = 'vega_columns_sizes_store';
const COLUMNS_SET_DEBOUNCE_TIME = 300;

export const useColumnSizesStore = create<{
  sizes: Record<string, Record<string, number>>;
  valueSetter: (id: string, value: Record<string, number>) => void;
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
  id?: string;
  container?: MutableRefObject<HTMLDivElement | null>;
}
export const useColumnSizes = ({ id = '', container }: UseColumnSizesProps) => {
  const sizes = useColumnSizesStore((store) => store.sizes[id] || {});
  const valueSetter = useColumnSizesStore((store) => store.valueSetter);
  const getWidthOfAll = useCallback(
    () =>
      (container?.current as HTMLDivElement)?.getBoundingClientRect().width ??
      0,
    [container]
  );
  // const recalculateSizes = useCallback(
  //   (sizes: Record<string, number>) => {
  //     const width = getWidthOfAll();
  //     if (width && sizes['width'] && width !== sizes['width']) {
  //       const oldWidth = sizes['width'];
  //       const ratio = width / oldWidth;
  //       return {
  //         ...Object.entries(sizes).reduce((agg, [key, value]) => {
  //           agg[key] = value * ratio;
  //           return agg;
  //         }, {} as Record<string, number>),
  //         width,
  //       } as Record<string, number>;
  //     }
  //     return sizes;
  //   },
  //   [getWidthOfAll]
  // );
  // const [calculatedSizes, setCalculatedSizes] = useState(
  //   recalculateSizes(sizes)
  // );
  // const onResize = useCallback(() => {
  //   const width = getWidthOfAll();
  //   if (width && sizes['width'] && width !== sizes['width']) {
  //     setCalculatedSizes(recalculateSizes(sizes));
  //   }
  // }, [getWidthOfAll, recalculateSizes, sizes]);
  // useResizeObserver(container?.current as Element, onResize);

  const onColumnResized = useCallback(
    (event: ColumnResizedEvent) => {
      if (
        event.finished &&
        event.source === 'uiColumnDragged' &&
        event.columns
      ) {
        const colState = event.columnApi.getColumnState();
        const store: { [colId: string]: number } = {};
        colState.forEach((c) => {
          if (c.width) {
            store[c.colId] = c.width;
          }
        });
        valueSetter(id, store);
      }
    },
    [valueSetter, id]
  );

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      console.log(event);
      if (!Object.keys(sizes).length) {
        event.columnApi.sizeColumnsToFit(getWidthOfAll());
      } else {
        const initialSizes = Object.entries(sizes).map(([key, newWidth]) => ({
          key,
          newWidth,
        }));
        event.columnApi.setColumnWidths(initialSizes);
      }
    },
    [sizes, getWidthOfAll]
  );

  return {
    onColumnResized,
    onGridReady,
  };
};
