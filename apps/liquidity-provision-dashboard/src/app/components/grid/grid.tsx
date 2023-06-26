import { useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  AgGridReactProps,
  AgReactUiProps,
  AgGridReact as AgGridReactType,
} from 'ag-grid-react';
import classNames from 'classnames';
import 'ag-grid-community/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import './grid.scss';

type Props = (AgGridReactProps | AgReactUiProps) & {
  isRowClickable?: boolean;
  style?: React.CSSProperties;
};

export const Grid = ({ isRowClickable, ...props }: Props) => {
  const gridRef = useRef<AgGridReactType | null>(null);

  const resizeGrid = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);

  const handleOnGridReady = useCallback(() => {
    resizeGrid();
  }, [resizeGrid]);

  useEffect(() => {
    window.addEventListener('resize', resizeGrid);
    return () => window.removeEventListener('resize', resizeGrid);
  }, [resizeGrid]);

  return (
    <AgGridReact
      className={classNames('ag-theme-alpine h-full font-alpha calt', {
        'row-hover': isRowClickable,
      })}
      rowHeight={92}
      ref={gridRef}
      onGridReady={handleOnGridReady}
      suppressRowClickSelection
      {...props}
    />
  );
};
