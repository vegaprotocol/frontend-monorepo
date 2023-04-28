import type { ReactNode, FunctionComponent } from 'react';
import dynamic from 'next/dynamic';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type { ColumnResizedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useColumnSizes } from './use-column-sizes';
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
  id,
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
  const { theme } = useThemeSwitcher();
  const [, setValues] = useColumnSizes({ id });
  const defaultProps = {
    rowHeight: 22,
    headerHeight: 22,
    enableCellTextSelection: true,
    onColumnResized: (event: ColumnResizedEvent) => {
      if (event.source === 'uiColumnDragged') {
        setValues(event.columns);
      }
    },
  };

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
