import type { RefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { IsFullWidthRowParams, RowHeightParams } from 'ag-grid-community';

const NO_HOVER_CSS_RULE = { 'no-hover': 'data?.isLastPlaceholder' };
const fullWidthCellRenderer = () => null;
const isFullWidthRow = (params: IsFullWidthRowParams) =>
  params.rowNode.data?.isLastPlaceholder;

interface Props<T> {
  gridRef: RefObject<AgGridReact>;
  setId?: (data: T) => T;
  disabled?: boolean;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export const useBottomPlaceholder = <T extends {}>({
  gridRef,
  setId,
  disabled,
}: Props<T>) => {
  const placeholderRowRef = useRef<T | undefined>();
  const onBodyScrollEnd = useCallback(() => {
    const rowCont = gridRef.current?.api.getDisplayedRowCount() ?? 0;
    if (!placeholderRowRef.current && rowCont) {
      const firstRow = gridRef.current?.api.getDisplayedRowAtIndex(0);
      if (firstRow && firstRow.data) {
        placeholderRowRef.current = setId
          ? setId({ ...firstRow.data, isLastPlaceholder: true })
          : {
              ...firstRow.data,
              isLastPlaceholder: true,
              id: `${firstRow.data?.id || '-'}-1`,
            };
        gridRef.current?.api.applyTransaction({
          add: [placeholderRowRef.current],
        });
      }
    }
  }, [gridRef, setId]);

  const onRowsChanged = useCallback(() => {
    if (placeholderRowRef.current) {
      gridRef.current?.api.applyTransaction({
        remove: [placeholderRowRef.current],
      });
      placeholderRowRef.current = undefined;
    }
    onBodyScrollEnd();
  }, [gridRef, onBodyScrollEnd]);

  const getRowHeight = useCallback(
    (params: RowHeightParams) =>
      params.data?.isLastPlaceholder ? 50 : undefined,
    []
  );

  return useMemo(
    () =>
      !disabled
        ? {
            onBodyScrollEnd,
            rowClassRules: NO_HOVER_CSS_RULE,
            isFullWidthRow,
            fullWidthCellRenderer,
            onSortChanged: onRowsChanged,
            onFilterChanged: onRowsChanged,
            getRowHeight,
          }
        : {},
    [onBodyScrollEnd, onRowsChanged, disabled, getRowHeight]
  );
};
