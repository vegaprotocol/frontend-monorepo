import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import {
  useScreenDimensions,
  useThemeSwitcher,
} from '@vegaprotocol/react-helpers';
import type {
  GridOptions,
  GetRowIdParams,
  TabToNextCellParams,
  CellKeyDownEvent,
  FullWidthCellKeyDownEvent,
  IGetRowsParams,
  IDatasource,
} from 'ag-grid-community';
import { NO_DATA_MESSAGE } from '../../constants';
import * as constants from '../simple-market-list/constants';

export interface GetRowsParams<T>
  extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: T[], lastRow?: number): void;
}

export interface Datasource<T> extends IDatasource {
  getRows(params: GetRowsParams<T>): void;
}
interface Props<T> extends GridOptions {
  rowData?: T[];
  datasource?: Datasource<T>;
  handleRowClicked?: (event: { data: T }) => void;
  components?: Record<string, unknown>;
  classNamesParam?: string | string[];
}

const ConsoleLiteGrid = <T extends { id?: string }>(
  { handleRowClicked, getRowId, classNamesParam, ...props }: Props<T>,
  ref?: React.Ref<AgGridReact>
) => {
  const { isMobile, screenSize } = useScreenDimensions();
  const gridRef = useRef<AgGridReact | null>(null);
  const { theme } = useThemeSwitcher();
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
      className={classNames(classNamesParam)}
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
      overlayNoRowsTemplate={NO_DATA_MESSAGE}
      enableCellTextSelection={true}
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

const ConsoleLiteGridForwarder = forwardRef(ConsoleLiteGrid) as <T>(
  p: Props<T> & { ref?: React.Ref<AgGridReact> }
) => React.ReactElement;

export default ConsoleLiteGridForwarder;
