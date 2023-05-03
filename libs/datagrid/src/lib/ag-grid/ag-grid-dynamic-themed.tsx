import React, { useCallback, useRef } from 'react';
import type {
  ReactElement,
  ReactNode,
  FunctionComponent,
  CSSProperties,
} from 'react';
import dynamic from 'next/dynamic';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type { ColumnResizedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { useColumnSizes } from './use-column-sizes';
import 'ag-grid-community/dist/styles/ag-grid.css';

interface GridProps {
  children: ReactNode;
  customThemeParams?: string | undefined;
}

const AgGridLightTheme = dynamic<GridProps>(
  () => import('./ag-grid-light').then((mod) => mod.AgGrid),
  { ssr: false }
) as FunctionComponent<GridProps>;

const AgGridDarkTheme = dynamic<GridProps>(
  () => import('./ag-grid-dark').then((mod) => mod.AgGrid),
  { ssr: false }
) as FunctionComponent<GridProps>;

export const AgGridThemed = ({
  id,
  style,
  className,
  gridRef,
  customThemeParams,
  children,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: CSSProperties;
  className?: string;
  gridRef?: React.ForwardedRef<AgGridReact>;
  customThemeParams?: string;
  id?: string;
  children?: ReactNode[];
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useThemeSwitcher();
  const [sizes, setValues] = useColumnSizes({ id, container: containerRef });
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
  const sizedChildren = children.map((child: ReactElement) => {
    return {
      ...child,
      props: {
        ...(child?.props ?? {}),
        width: sizes[child?.props.field],
        headerName:
          (child?.props.headerName || ' - ') +
          ' ' +
          (sizes[child?.props.field] || 'unk'),
      },
    };
  });
  return (
    <div
      className={`${className ?? ''} ${
        theme === 'dark' ? 'ag-theme-balham-dark' : 'ag-theme-balham'
      }`}
      style={style}
      ref={containerRef}
    >
      {theme === 'dark' ? (
        <AgGridDarkTheme customThemeParams={customThemeParams}>
          <AgGridReact {...defaultProps} {...props} ref={gridRef}>
            {sizedChildren}
          </AgGridReact>
        </AgGridDarkTheme>
      ) : (
        <AgGridLightTheme customThemeParams={customThemeParams}>
          <AgGridReact {...defaultProps} {...props} ref={gridRef}>
            {sizedChildren}
          </AgGridReact>
        </AgGridLightTheme>
      )}
    </div>
  );
};
