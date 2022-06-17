import { forwardRef } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { TransactionsData } from './transactions-manager';

interface TransactionsTableProps {
  data: TransactionsData[] | null;
}

export const TransactionsTable = forwardRef<
  AgGridReact,
  TransactionsTableProps
>(({ data }, ref) => {
  return (
    <div style={{ height: '500px' }}>
      <AgGrid
        ref={ref}
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No transactions')}
        rowData={data}
        getRowId={({ data }) => data.id}
      >
        <AgGridColumn headerName={t('Asset')} field="asset.symbol" />
        <AgGridColumn headerName={t('Amount')} field="amount" />
      </AgGrid>
    </div>
  );
});

export default TransactionsTable;
