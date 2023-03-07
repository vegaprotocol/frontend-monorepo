import type { RefObject } from 'react';
import { useCallback, useMemo } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { IsFullWidthRowParams } from 'ag-grid-community';

const NO_HOVER_CSS_RULE = { 'no-hover': 'data?.isLastPlaceholder' };
const fullWidthCellRenderer = () => null;

interface Props<T> {
  gridRef: RefObject<AgGridReact>;
  setId?: (data: T) => T;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export const useBottomPlaceholder = <T extends {}>({
  gridRef,
  setId,
}: Props<T>) => {
  const onBodyScrollEnd = useCallback(() => {
    const rowCont = gridRef.current?.api.getModel().getRowCount() ?? 0;
    const lastRowIndex = gridRef.current?.api.getLastDisplayedRow() ?? 0;
    if (lastRowIndex && rowCont - 1 === lastRowIndex) {
      const lastRow = gridRef.current?.api.getDisplayedRowAtIndex(lastRowIndex);
      if (lastRow?.data && !lastRow?.data.isLastPlaceholder) {
        const newData = setId
          ? setId({ ...lastRow.data, isLastPlaceholder: true })
          : {
              ...lastRow.data,
              isLastPlaceholder: true,
              id: `${lastRow.data?.id || '-'}-1`,
            };
        const add = [newData];
        gridRef.current?.api.applyTransaction({
          add,
          addIndex: lastRowIndex + 1,
        });
        const newLastRow = gridRef.current?.api.getDisplayedRowAtIndex(
          lastRowIndex + 1
        );
        newLastRow?.setRowHeight(50);
        gridRef.current?.api.onRowHeightChanged();
      }
    }
  }, [gridRef, setId]);

  const isFullWidthRow = useCallback(
    (params: IsFullWidthRowParams) => params.rowNode.data?.isLastPlaceholder,
    []
  );

  return useMemo(
    () => ({
      onBodyScrollEnd,
      rowClassRules: NO_HOVER_CSS_RULE,
      isFullWidthRow,
      fullWidthCellRenderer,
    }),
    [onBodyScrollEnd, isFullWidthRow]
  );
};
