import * as React from 'react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

/*
const LazyAgGrid = React.lazy(() =>
  import('ag-grid-react').then((module) => ({
    default: module.AgGridReact,
  }))
);
*/

export const AgGridThemed = ({
  style,
  ...props
}: (AgGridReactProps | AgReactUiProps) & { style: React.CSSProperties }) => {
  const theme = React.useContext(ThemeContext);
  return (
    <div
      className={theme === 'dark' ? 'ag-theme-balham-dark' : 'ag-theme-balham'}
      style={style}
    >
      <AgGridReact {...props} />
    </div>
  );
};
