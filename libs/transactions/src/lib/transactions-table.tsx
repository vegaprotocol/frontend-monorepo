import { forwardRef } from 'react';
import {
  PriceCell,
  t,
} from '@vegaprotocol/react-helpers';
import type { SummaryRow } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { TransactionsData } from './transactions-manager';

interface TransactionsTableProps {
  data: TransactionsData[] | null;
}

const comparator = (
  valueA: string,
  valueB: string,
  nodeA: { data: TransactionsData & SummaryRow },
  nodeB: { data: TransactionsData & SummaryRow },
  isInverted: boolean
) => {
  if (valueA < valueB) {
    return -1;
  }

  if (valueA > valueB) {
    return 1;
  }

  if (nodeA.data.__summaryRow) {
    return isInverted ? -1 : 1;
  }

  if (nodeB.data.__summaryRow) {
    return isInverted ? 1 : -1;
  }

  return 0;
};

export const TransactionsTable = forwardRef<
  AgGridReact,
  TransactionsTableProps
>(({ data }, ref) => {
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate={t('No transactions')}
      rowData={data}
      getRowId={({ data }) => data.id}
      ref={ref}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      components={{ PriceCell }}
      onGridReady={(event) => {
        event.columnApi.applyColumnState({
          state: [
            {
              colId: 'asset.symbol',
              sort: 'asc',
            },
          ],
        });
      }}
    >
      <AgGridColumn
        headerName={t('Type')}
        field="__typename"
        valueFormatter="value || '—'"
      />
      <AgGridColumn
        headerName={t('Amount')}
        field="amount"
        sortable
      />
      <AgGridColumn
        headerName={t('Asset')}
        field="asset.symbol"
        sortable
        sortingOrder={['asc', 'desc']}
        comparator={comparator}
      />
      <AgGridColumn
        headerName={t('Status')}
        field="status"
      />
    </AgGrid>
  );
});

export default TransactionsTable;
