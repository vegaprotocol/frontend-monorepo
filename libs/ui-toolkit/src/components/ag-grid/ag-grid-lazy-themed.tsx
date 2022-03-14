import * as React from 'react';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import 'ag-grid-community/dist/styles/ag-grid.css';

const AgGridLightTheme = React.lazy(() =>
  import('./ag-grid-light').then((module) => ({
    default: module.AgGrid,
  }))
);

const AgGridDarkTheme = React.lazy(() =>
  import('./ag-grid-dark').then((module) => ({
    default: module.AgGrid,
  }))
);

export const AgGridThemed = ({
  style,
  className,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  className?: string;
}) => {
  const theme = React.useContext(ThemeContext);
  return (
    <div
      className={`${className ?? ''} ${
        theme === 'dark' ? 'ag-theme-balham-dark' : 'ag-theme-balham'
      }`}
      style={style}
    >
      {theme === 'dark' ? (
        <AgGridDarkTheme>
          <AgGridReact {...props} />
        </AgGridDarkTheme>
      ) : (
        <AgGridLightTheme>
          <AgGridReact {...props} />
        </AgGridLightTheme>
      )}
    </div>
  );
};
