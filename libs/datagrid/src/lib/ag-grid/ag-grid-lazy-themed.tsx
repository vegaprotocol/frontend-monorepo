import React, { useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type { ColumnResizedEvent, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useColumnSizes } from './use-column-sizes';
import classNames from 'classnames';

export const AgGridThemed = ({
  style,
  gridRef,
  id,
  children,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  gridRef?: React.ForwardedRef<AgGridReact>;
  id?: string;
  children?: ReactNode[];
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setValues] = useColumnSizes({
    id,
    container: containerRef,
  });
  const { theme } = useThemeSwitcher();
  const defaultProps = {
    rowHeight: 22,
    headerHeight: 22,
    enableCellTextSelection: true,
    onColumnResized: useCallback(
      (event: ColumnResizedEvent) => {
        if (event.source === 'uiColumnDragged' && event.columns) {
          setValues(event.columns);
        }
      },
      [setValues]
    ),
  };

  const defaultOnGridReady = useCallback(
    (event: GridReadyEvent) => {
      if (!Object.keys(sizes).length) {
        event.api.sizeColumnsToFit();
      } else {
        const newSizes = Object.entries(sizes).map(([key, size]) => ({
          key,
          newWidth: size,
        }));
        event.columnApi.setColumnWidths(newSizes);
      }
    },
    [sizes]
  );
  const { onGridReady } = props;
  const onGridReadyInternal = useCallback(
    (event: GridReadyEvent) => {
      onGridReady?.(event);
      defaultOnGridReady(event);
    },
    [defaultOnGridReady, onGridReady]
  );

  const wrapperClasses = classNames('vega-ag-grid', {
    'ag-theme-balham': theme === 'light',
    'ag-theme-balham-dark': theme === 'dark',
  });
  return (
    <div className={wrapperClasses} style={style} ref={containerRef}>
      <AgGridReact
        {...defaultProps}
        {...props}
        ref={gridRef}
        onGridReady={onGridReadyInternal}
      >
        {children}
      </AgGridReact>
    </div>
  );
};
