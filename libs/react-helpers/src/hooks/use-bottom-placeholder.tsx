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
      const lastRow = gridRef.current?.api.getDisplayedRowAtIndex(rowCont - 1);
      if (lastRow && lastRow.data) {
        placeholderRowRef.current = setId
          ? setId({ ...lastRow.data, isLastPlaceholder: true })
          : {
              ...lastRow.data,
              isLastPlaceholder: true,
              id: `${lastRow.data?.id || '-'}-1`,
            };
        const transaction = {
          add: [placeholderRowRef.current],
        };
        gridRef.current?.api.applyTransaction(transaction);
      }
    }
  }, [gridRef, setId]);

  const onRowsChanged = useCallback(() => {
    if (placeholderRowRef.current) {
      const transaction = {
        remove: [placeholderRowRef.current],
      };
      gridRef.current?.api.applyTransaction(transaction);
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
