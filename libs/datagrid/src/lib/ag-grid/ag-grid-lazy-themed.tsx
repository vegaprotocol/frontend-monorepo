import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
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
  const [sizes, setValues] = useColumnSizes({ id, container: containerRef });
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
  const sizedChildren = children.map((child: ReactElement) => {
    return {
      ...child,
      props: {
        ...(child?.props ?? {}),
        width: sizes[child?.props.field],
      },
    };
  });
  const wrapperClasses = classNames('vega-ag-grid', {
    'ag-theme-balham': theme === 'light',
    'ag-theme-balham-dark': theme === 'dark',
  });
  return (
    <div className={wrapperClasses} style={style} ref={containerRef}>
      <AgGridReact {...defaultProps} {...props} ref={gridRef}>
        {sizedChildren}
      </AgGridReact>
    </div>
  );
};
