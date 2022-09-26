import { forwardRef } from 'react';
import type {
  ColumnApi,
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
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
import type { AccountFieldsFragment } from './__generated___/Accounts';
import { getId } from './accounts-data-provider';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { AccountType } from '@vegaprotocol/types';
import { AccountTypeMapping } from '@vegaprotocol/types';

interface AccountsTableProps {
  data: AccountFieldsFragment[] | null;
}

interface AccountsTableValueFormatterParams extends ValueFormatterParams {
  data: AccountFieldsFragment;
}

export const getGroupId = (
  data: AccountFieldsFragment & SummaryRow,
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
  data: AccountFieldsFragment[],
  columnApi: ColumnApi
): Partial<AccountFieldsFragment & SummaryRow> | null => {
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
  nodeA: { data: AccountFieldsFragment & SummaryRow },
  nodeB: { data: AccountFieldsFragment & SummaryRow },
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
    const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No accounts')}
        rowData={data}
        getRowId={({ data }) => getId(data)}
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
          cellRenderer={({ value }: GroupCellRendererParams) =>
            value && value.length > 0 ? (
              <button
                className="hover:underline"
                onClick={(e) => {
                  openAssetDetailsDialog(value, e.target as HTMLElement);
                }}
              >
                {value}
              </button>
            ) : (
              ''
            )
          }
        />
        <AgGridColumn
          headerName={t('Type')}
          field="type"
          valueFormatter={({ value }: ValueFormatterParams) =>
            value ? AccountTypeMapping[value as AccountType] : '-'
          }
        />
        <AgGridColumn
          headerName={t('Market')}
          field="market.tradableInstrument.instrument.name"
          valueFormatter="value || '—'"
        />
        <AgGridColumn
          headerName={t('Balance')}
          field="balance"
          cellRenderer="PriceCell"
          type="rightAligned"
          valueFormatter={({
            value,
            data,
          }: AccountsTableValueFormatterParams) =>
            addDecimalsFormatNumber(value, data.asset.decimals)
          }
        />
      </AgGrid>
    );
  }
);

export default AccountsTable;
