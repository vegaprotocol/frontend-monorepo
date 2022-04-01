import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import { PriceCell, formatNumber, t } from '@vegaprotocol/react-helpers';
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
      >
        <AgGridColumn headerName={t('Asset')} field="asset.symbol" />
        <AgGridColumn headerName={t('Type')} field="type" />
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
        <AgGridColumn headerName={t('Market')} field="market.name" />
      </AgGrid>
    );
  }
);

export default AccountsTable;
