import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import classNames from 'classnames';

const defaultProps: AgGridReactProps = {
  rowHeight: 22,
  headerHeight: 22,
  enableCellTextSelection: true,
  overlayLoadingTemplate: t('Loading...'),
  overlayNoRowsTemplate: t('No data'),
  suppressCellFocus: true,
};

const defaultColDef = {
  resizable: true,
};

export const AgGridThemed = ({
  style,
  gridRef,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  gridRef?: React.ForwardedRef<AgGridReact>;
}) => {
  const { theme } = useThemeSwitcher();

  const wrapperClasses = classNames('vega-ag-grid', {
    'ag-theme-balham': theme === 'light',
    'ag-theme-balham-dark': theme === 'dark',
  });

  return (
    <div className={wrapperClasses} style={style}>
      <AgGridReact
        {...defaultProps}
        {...props}
        defaultColDef={{
          ...defaultColDef,
          ...props.defaultColDef,
        }}
        ref={gridRef}
      />
    </div>
  );
};
