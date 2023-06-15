import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import { useColumnSizes } from './use-column-sizes';
import classNames from 'classnames';

export const AgGridThemed = ({
  style,
  gridRef,
  storeKey,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  gridRef?: React.ForwardedRef<AgGridReact>;
  storeKey?: string;
}) => {
  const commonColumnCallbacks = useColumnSizes({
    storeKey,
    props,
  });
  const { theme } = useThemeSwitcher();
  const defaultProps = {
    rowHeight: 22,
    headerHeight: 22,
    enableCellTextSelection: true,
    overlayLoadingTemplate: t('Loading...'),
    overlayNoRowsTemplate: t('No data'),
    suppressCellFocus: true,
  };

  const wrapperClasses = classNames('vega-ag-grid', {
    'ag-theme-balham': theme === 'light',
    'ag-theme-balham-dark': theme === 'dark',
  });

  return (
    <div className={wrapperClasses} style={style}>
      <AgGridReact
        {...defaultProps}
        {...props}
        {...commonColumnCallbacks}
        ref={gridRef}
      />
    </div>
  );
};
