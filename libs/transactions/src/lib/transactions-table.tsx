import { forwardRef } from 'react';
import type { ColumnApi, ValueFormatterParams } from 'ag-grid-community';
import {
  PriceCell,
  addDecimalsFormatNumber,
  t,
  addSummaryRows,
} from '@vegaprotocol/react-helpers';
import type { SummaryRow } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { TransactionsData } from './transactions-data-provider';

interface TransactionsTableProps {
  data: TransactionsData[] | null;
}

interface TransactionsTableValueFormatterParams extends ValueFormatterParams {
  data: TransactionsData;
}

export const getGroupId = (
  data: TransactionsData & SummaryRow,
  columnApi: ColumnApi
) => {
  if (data.__summaryRow) {
    return null;
  }
  const sortColumnId = columnApi.getColumnState().find((c) => c.sort)?.colId;
  switch (sortColumnId) {
    case 'asset.symbol':
      return data.asset.id;
  }
  return undefined;
};

export const getGroupSummaryRow = (
  data: TransactionsData[],
  columnApi: ColumnApi
): Partial<TransactionsData & SummaryRow> | null => {
  if (!data.length) {
    return null;
  }
  const sortColumnId = columnApi.getColumnState().find((c) => c.sort)?.colId;
  switch (sortColumnId) {
    case 'asset.symbol':
      return {
        __summaryRow: true,
        balance: data
          .reduce((a, i) => a + (parseFloat(i.balance) || 0), 0)
          .toString(),
        asset: data[0].asset,
      };
  }
  return null;
};

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
      onSortChanged={({ api, columnApi }) => {
        addSummaryRows(api, columnApi, getGroupId, getGroupSummaryRow);
      }}
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
        headerName={t('Asset')}
        field="asset.symbol"
        sortable
        sortingOrder={['asc', 'desc']}
        comparator={comparator}
      />
      <AgGridColumn
        headerName={t('Type')}
        field="type"
        valueFormatter="value || '—'"
      />
      <AgGridColumn
        headerName={t('Market')}
        field="market.name"
        valueFormatter="value || '—'"
      />
      <AgGridColumn
        headerName={t('Balance')}
        field="balance"
        cellRenderer="PriceCell"
        valueFormatter={({
          value,
          data,
        }: TransactionsTableValueFormatterParams) =>
          addDecimalsFormatNumber(value, data.asset.decimals)
        }
      />
    </AgGrid>
  );
});

export default TransactionsTable;
