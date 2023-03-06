import type { RefObject } from 'react';
import { useCallback, useMemo } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

const NO_HOVER_CSS_RULE = { 'no-hover': '!data' };

interface Props {
  gridRef: RefObject<AgGridReact>;
}
export const useBottomPlaceholder = ({ gridRef }: Props) => {
  const onBodyScrollEnd = useCallback(() => {
    const rowCont = gridRef.current?.api.getModel().getRowCount() ?? 0;
    const lastRowIndex = gridRef.current?.api.getLastDisplayedRow() ?? 0;
    if (lastRowIndex && rowCont - 1 === lastRowIndex) {
      const lastRow = gridRef.current?.api.getDisplayedRowAtIndex(lastRowIndex);
      lastRow?.setRowHeight(50);
      gridRef.current?.api.onRowHeightChanged();
    }
  }, []);

  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      height: 50,
      cellRendererParams: {
        footerValueGetter: () => null,
      },
    };
  }, []);

  return useMemo(
    () => ({
      onBodyScrollEnd,
      autoGroupColumnDef,
      groupIncludeTotalFooter: true,
      rowClassRules: NO_HOVER_CSS_RULE,
    }),
    []
  );
};
