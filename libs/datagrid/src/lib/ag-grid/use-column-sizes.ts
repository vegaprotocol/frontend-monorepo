import { useCallback, useRef } from 'react';
import type {
  GridSizeChangedEvent,
  GridReadyEvent,
  ColumnResizedEvent,
} from 'ag-grid-community';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const STORAGE_KEY = 'vega_columns_sizes_store';

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
  props: AgGridReactProps | AgReactUiProps;
  storeKey?: string;
}

export const useColumnSizes = ({
  storeKey = '',
  props,
}: UseColumnSizesProps): {
  onColumnResized?: (event: ColumnResizedEvent) => void;
  onGridReady?: (event: GridReadyEvent) => void;
  onGridSizeChanged?: (event: GridSizeChangedEvent) => void;
} => {
  const sizes = useColumnSizesStore((store) => store.sizes[storeKey] || {});
  const valueSetter = useColumnSizesStore((store) => store.valueSetter);
  const widthRef = useRef(sizes['clientWidth'] || 0);
  const {
    onColumnResized: parentOnColumnResized,
    onGridReady: parentOnGridReady,
    onGridSizeChanged: parentOnGridSizeChanged,
  } = props;
  const recalculateSizes = useCallback((sizes: Record<string, number>) => {
    if (
      widthRef.current &&
      sizes['clientWidth'] &&
      widthRef.current !== sizes['clientWidth']
    ) {
      const oldWidth = sizes['clientWidth'];
      const ratio = widthRef.current / oldWidth;
      return {
        ...Object.entries(sizes).reduce((agg, [key, value]) => {
          agg[key] = value * ratio;
          return agg;
        }, {} as Record<string, number>),
        width: widthRef.current,
      } as Record<string, number>;
    }
    return sizes;
  }, []);

  const onColumnResized = useCallback(
    (event: ColumnResizedEvent) => {
      parentOnColumnResized?.(event);
      if (
        storeKey &&
        event.source === 'uiColumnDragged' &&
        event.finished &&
        widthRef.current
      ) {
        const { columns } = event;
        if (columns?.length) {
          const sizesObj = columns.reduce((aggr, column) => {
            aggr[column.getColId()] = column.getActualWidth();
            return aggr;
          }, {} as Record<string, number>);
          sizesObj['clientWidth'] = widthRef.current;
          valueSetter(storeKey, sizesObj);
        }
      }
    },
    [valueSetter, storeKey, parentOnColumnResized]
  );

  const setSizes = useCallback(
    (apiEvent: GridReadyEvent | GridSizeChangedEvent) => {
      if (!storeKey || !Object.keys(sizes).length || !widthRef.current) {
        apiEvent?.api.sizeColumnsToFit();
      } else {
        const recalculatedSizes = recalculateSizes(sizes);
        const newSizes = Object.entries(recalculatedSizes).map(
          ([key, size]) => ({
            key,
            newWidth: size,
          })
        );
        apiEvent.columnApi.setColumnWidths(newSizes);
      }
    },
    [storeKey, recalculateSizes, sizes]
  );

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      parentOnGridReady?.(event);
      setSizes(event);
    },
    [setSizes, parentOnGridReady]
  );

  const onGridSizeChanged = useCallback(
    (event: GridSizeChangedEvent) => {
      parentOnGridSizeChanged?.(event);
      widthRef.current = event.clientWidth;
      setSizes(event);
    },
    [parentOnGridSizeChanged, setSizes]
  );
  if (storeKey) {
    return {
      onGridReady,
      onGridSizeChanged,
      onColumnResized,
    };
  }
  return {
    onGridReady: parentOnGridReady,
    onGridSizeChanged: parentOnGridSizeChanged,
    onColumnResized: parentOnColumnResized,
  };
};
