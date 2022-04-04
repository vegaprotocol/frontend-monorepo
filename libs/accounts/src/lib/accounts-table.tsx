import { forwardRef } from 'react';
import type { ColumnApi, ValueFormatterParams } from 'ag-grid-community';
import {
  PriceCell,
  formatNumber,
  t,
  addSummaryRows,
} from '@vegaprotocol/react-helpers';
import type { SummaryRow } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { Accounts_party_accounts } from './__generated__/Accounts';
import { getId as getRowNodeId } from './accounts-data-provider';

interface AccountsTableProps {
  data: Accounts_party_accounts[] | null;
}

interface AccountsTableValueFormatterParams extends ValueFormatterParams {
  data: Accounts_party_accounts;
}

export const getGroupId = (
  data: Accounts_party_accounts & SummaryRow,
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
  data: Accounts_party_accounts[],
  columnApi: ColumnApi
): Partial<Accounts_party_accounts & SummaryRow> | null => {
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
  nodeA: { data: Accounts_party_accounts & SummaryRow },
  nodeB: { data: Accounts_party_accounts & SummaryRow },
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

export const AccountsTable = forwardRef<AgGridReact, AccountsTableProps>(
  ({ data }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No accounts')}
        rowData={data}
        getRowNodeId={getRowNodeId}
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
          }: AccountsTableValueFormatterParams) =>
            formatNumber(value, data.asset.decimals)
          }
        />
      </AgGrid>
    );
  }
);

export default AccountsTable;
