import type { MutableRefObject, ReactElement } from 'react';
import { useCallback, useState } from 'react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type { Column, ColDef } from 'ag-grid-community';
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
export const useColumnSizes = ({
  id = '',
  container,
}: UseColumnSizesProps): [
  (columns: Column[]) => void,
  (children?: ReactElement[]) => ReactElement[] | undefined,
  (
    props: AgGridReactProps | AgReactUiProps,
    children?: ReactElement[]
  ) => AgGridReactProps | AgReactUiProps
] => {
  const sizes = useColumnSizesStore((store) => store.sizes[id] || {});
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
  const [calculatedSizes, setCalculatedSizes] = useState(
    recalculateSizes(sizes)
  );
  const onResize = useCallback(() => {
    const width = getWidthOfAll();
    if (width && sizes['width'] && width !== sizes['width']) {
      setCalculatedSizes(recalculateSizes(sizes));
    }
  }, [getWidthOfAll, recalculateSizes, sizes]);
  useResizeObserver(container?.current as Element, onResize);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOnChange = useCallback(
    debounce((columns: Column[]) => {
      if (id && columns.length) {
        const sizesObj = columns.reduce((aggr, column) => {
          aggr[column.getColId()] = column.getActualWidth();
          return aggr;
        }, {} as Record<string, number>);
        sizesObj['width'] = getWidthOfAll();
        valueSetter(id, sizesObj);
      }
    }, COLUMNS_SET_DEBOUNCE_TIME),
    [valueSetter, id]
  );
  const reshapeAgGridChildren = useCallback(
    (children?: ReactElement[]) =>
      id && children?.length && Object.keys(calculatedSizes).length
        ? children.map((child: ReactElement) => ({
            ...child,
            props: {
              ...(child?.props ?? {}),
              width:
                (child?.props.colId && calculatedSizes[child?.props.colId]) ||
                (child?.props.field && calculatedSizes[child?.props.field]) ||
                undefined,
            },
          }))
        : children,
    [calculatedSizes, id]
  );
  const reshapeAgGridProps = useCallback(
    (props: AgGridReactProps | AgReactUiProps, children?: ReactElement[]) =>
      id && props?.columnDefs && Object.keys(calculatedSizes).length
        ? ({
            ...props,
            columnDefs: props.columnDefs.map((columnDef: ColDef) => ({
              ...columnDef,
              width:
                (columnDef.colId && calculatedSizes[columnDef.colId]) ||
                (columnDef.field && calculatedSizes[columnDef.field]) ||
                undefined,
            })),
          } as AgGridReactProps | AgReactUiProps)
        : children?.length
        ? props
        : ({
            ...props,
            defaultColDef: { ...(props.defaultColDef || null), flex: 1 },
          } as AgGridReactProps | AgReactUiProps),
    [calculatedSizes, id]
  );
  return [handleOnChange, reshapeAgGridChildren, reshapeAgGridProps];
};
