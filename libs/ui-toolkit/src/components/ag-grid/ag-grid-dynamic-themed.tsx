import type { ReactNode, FunctionComponent } from 'react';
import { useContext } from 'react';
import dynamic from 'next/dynamic';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import 'ag-grid-community/dist/styles/ag-grid.css';

interface GridProps {
  children: ReactNode;
  customThemeParams: string;
}

const AgGridLightTheme = dynamic<GridProps>(
  () => import('./ag-grid-light').then((mod) => mod.AgGrid),
  { ssr: false }
) as FunctionComponent<GridProps>;

const AgGridDarkTheme = dynamic(
  () => import('./ag-grid-dark').then((mod) => mod.AgGrid),
  { ssr: false }
) as FunctionComponent<GridProps>;

export const AgGridThemed = ({
  style,
  className,
  gridRef,
  customThemeParams = '',
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  className?: string;
  gridRef?: React.ForwardedRef<AgGridReact>;
  customThemeParams?: string;
}) => {
  const theme = useContext(ThemeContext);
  const defaultProps = { rowHeight: 20, headerHeight: 22 };
  return (
    <div
      className={`${className ?? ''} ${
        theme === 'dark' ? 'ag-theme-balham-dark' : 'ag-theme-balham'
      }`}
      style={style}
    >
      {theme === 'dark' ? (
        <AgGridDarkTheme customThemeParams={customThemeParams}>
          <AgGridReact {...defaultProps} {...props} ref={gridRef} />
        </AgGridDarkTheme>
      ) : (
        <AgGridLightTheme customThemeParams={customThemeParams}>
          <AgGridReact {...defaultProps} {...props} ref={gridRef} />
        </AgGridLightTheme>
      )}
    </div>
  );
};
