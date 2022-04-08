import * as React from 'react';
import dynamic from 'next/dynamic';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import 'ag-grid-community/dist/styles/ag-grid.css';

const AgGridLightTheme = dynamic<{ children: React.ReactElement }>(
  () => import('./ag-grid-light').then((mod) => mod.AgGrid),
  { ssr: false }
);

const AgGridDarkTheme = dynamic<{ children: React.ReactElement }>(
  () => import('./ag-grid-dark').then((mod) => mod.AgGrid),
  { ssr: false }
);

export const AgGridThemed = ({
  style,
  className,
  gridRef,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  className?: string;
  gridRef?: React.ForwardedRef<AgGridReact>;
}) => {
  const theme = React.useContext(ThemeContext);
  const defaultProps = { rowHeight: 20, headerHeight: 22 };
  return (
    <div
      className={`${className ?? ''} ${
        theme === 'dark' ? 'ag-theme-balham-dark' : 'ag-theme-balham'
      }`}
      style={style}
    >
      {theme === 'dark' ? (
        // @ts-ignore TODO: fix me
        <AgGridDarkTheme>
          <AgGridReact {...defaultProps} {...props} ref={gridRef} />
        </AgGridDarkTheme>
      ) : (
        // @ts-ignore TODO: fix me
        <AgGridLightTheme>
          <AgGridReact {...defaultProps} {...props} ref={gridRef} />
        </AgGridLightTheme>
      )}
    </div>
  );
};
