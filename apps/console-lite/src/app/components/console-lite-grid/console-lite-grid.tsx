import * as constants from '../simple-market-list/constants';
import {
  t,
  ThemeContext,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type {
  GetRowIdParams,
  TabToNextCellParams,
  CellKeyDownEvent,
  FullWidthCellKeyDownEvent,
  ColDef,
  ColGroupDef,
} from 'ag-grid-community';

interface Props<T> {
  columnDefs: (ColDef | ColGroupDef)[] | null;
  data: T[];
  defaultColDef: ColDef;
  handleRowClicked?: (event: { data: T }) => void;
}

const ConsoleLiteGrid = <T extends { id: string }>({
  columnDefs,
  data,
  defaultColDef,
  handleRowClicked,
}: Props<T>) => {
  const { isMobile, screenSize } = useScreenDimensions();
  const gridRef = useRef<AgGridReact | null>(null);
  const theme = useContext(ThemeContext);
  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);
  const onTabToNextCell = useCallback((params: TabToNextCellParams) => {
    const {
      api,
      previousCellPosition: { rowIndex },
    } = params;
    const rowCount = api.getDisplayedRowCount();
    if (rowCount <= rowIndex + 1) {
      return null;
    }
    return { ...params.previousCellPosition, rowIndex: rowIndex + 1 };
  }, []);
  const getRowId = useCallback(({ data }: GetRowIdParams) => data.id, []);
  const onCellKeyDown = useCallback(
    (
      params: (CellKeyDownEvent | FullWidthCellKeyDownEvent) & {
        event: KeyboardEvent;
      }
    ) => {
      const { event: { key = '' } = {}, data } = params;
      if (key === 'Enter') {
        handleRowClicked?.({ data });
      }
    },
    [handleRowClicked]
  );
  const shouldSuppressHorizontalScroll = useMemo(() => {
    return !isMobile && constants.LARGE_SCREENS.includes(screenSize);
  }, [isMobile, screenSize]);

  return (
    <AgGrid
      className="mb-32 min-h-[300px]"
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      rowData={data}
      rowHeight={60}
      customThemeParams={
        theme === 'dark'
          ? constants.agGridDarkVariables
          : constants.agGridLightVariables
      }
      onGridReady={handleOnGridReady}
      onRowClicked={handleRowClicked}
      rowClass={isMobile ? 'mobile' : ''}
      rowClassRules={constants.ROW_CLASS_RULES}
      ref={gridRef}
      overlayNoRowsTemplate={t('No data to display')}
      suppressContextMenu
      getRowId={getRowId}
      suppressMovableColumns
      suppressRowTransform
      onCellKeyDown={onCellKeyDown}
      tabToNextCell={onTabToNextCell}
      suppressHorizontalScroll={shouldSuppressHorizontalScroll}
    />
  );
};

export default ConsoleLiteGrid;
