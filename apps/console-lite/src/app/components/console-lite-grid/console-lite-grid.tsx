import * as constants from '../simple-market-list/constants';
import {
  t,
  ThemeContext,
  useScreenDimensions,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type {
  GridOptions,
  GetRowIdParams,
  TabToNextCellParams,
  CellKeyDownEvent,
  FullWidthCellKeyDownEvent,
} from 'ag-grid-community';

interface Props<T> extends GridOptions {
  data?: T[];
  handleRowClicked?: (event: { data: T }) => void;
  components?: Record<string, unknown>;
}

const ConsoleLiteGrid = <T extends { id?: string }>(
  { data, handleRowClicked, getRowId, ...props }: Props<T>,
  ref?: React.Ref<AgGridReact>
) => {
  const { isMobile, screenSize } = useScreenDimensions();
  const gridRef = useRef<AgGridReact | null>(null);
  const theme = useContext(ThemeContext);
  const handleOnGridReady = useCallback(() => {
    (
      (ref as React.RefObject<AgGridReact>) || gridRef
    ).current?.api?.sizeColumnsToFit();
  }, [gridRef, ref]);
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
  const getRowIdLocal = useCallback(({ data }: GetRowIdParams) => data.id, []);
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
      ref={ref || gridRef}
      overlayNoRowsTemplate={t('No data to display')}
      suppressContextMenu
      getRowId={getRowId || getRowIdLocal}
      suppressMovableColumns
      suppressRowTransform
      onCellKeyDown={onCellKeyDown}
      tabToNextCell={onTabToNextCell}
      suppressHorizontalScroll={shouldSuppressHorizontalScroll}
      {...props}
    />
  );
};

const ConsoleLiteGridForwarder = forwardRef(ConsoleLiteGrid) as <
  T extends { id?: string }
>(
  p: Props<T> & { ref?: React.Ref<AgGridReact> }
) => React.ReactElement;

export default ConsoleLiteGridForwarder;
