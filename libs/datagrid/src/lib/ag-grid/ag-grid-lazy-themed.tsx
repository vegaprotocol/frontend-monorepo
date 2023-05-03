import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';

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
  const { theme } = useThemeSwitcher();
  const defaultProps = {
    rowHeight: 22,
    headerHeight: 22,
    enableCellTextSelection: true,
  };
  const wrapperClasses = classNames(className, 'vega-ag-grid', {
    'ag-theme-balham': theme === 'light',
    'ag-theme-balham-dark': theme === 'dark',
  });

  return (
    <div className={wrapperClasses} style={style}>
      <AgGridReact {...defaultProps} {...props} ref={gridRef} />
    </div>
  );
};
