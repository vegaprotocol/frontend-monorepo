import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { cn } from '@vegaprotocol/ui-toolkit';
import type { ColDef } from 'ag-grid-community';
import { useT } from '../use-t';

const defaultProps: AgGridReactProps = {
  enableCellTextSelection: true,
  suppressCellFocus: true,
  suppressColumnMoveAnimation: true,
};

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
};

export const AgGridThemed = ({
  style,
  gridRef,
  ...props
}: (AgGridReactProps | AgReactUiProps) & {
  style?: React.CSSProperties;
  gridRef?: React.ForwardedRef<AgGridReact>;
}) => {
  const t = useT();
  const { theme } = useThemeSwitcher();

  const wrapperClasses = cn('vega-ag-grid', 'w-full h-full', {
    'ag-theme-balham': theme === 'light',
    'ag-theme-balham-dark': theme === 'dark',
  });

  return (
    <div className={wrapperClasses}>
      <AgGridReact
        defaultColDef={defaultColDef}
        overlayLoadingTemplate={t('Loading...')}
        overlayNoRowsTemplate={t('No data')}
        suppressDragLeaveHidesColumns
        ref={gridRef}
        {...defaultProps}
        {...props}
      />
    </div>
  );
};
