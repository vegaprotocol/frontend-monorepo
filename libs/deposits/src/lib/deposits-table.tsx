import { forwardRef } from 'react';
import { AgGridColumn } from 'ag-grid-react';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
  isNumeric,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/datagrid';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  TypedDataAgGrid,
} from '@vegaprotocol/datagrid';
import type { DepositFieldsFragment } from './__generated__/Deposit';
import { EtherscanLink } from '@vegaprotocol/environment';
import { DepositStatusMapping } from '@vegaprotocol/types';

export const DepositsTable = forwardRef<
  AgGridReact,
  TypedDataAgGrid<DepositFieldsFragment>
>((props, ref) => {
  return (
    <AgGrid
      ref={ref}
      overlayNoRowsTemplate={t('No deposits')}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      suppressCellFocus={true}
      {...props}
    >
      <AgGridColumn headerName="Asset" field="asset.symbol" />
      <AgGridColumn
        headerName="Amount"
        field="amount"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<DepositFieldsFragment, 'amount'>) => {
          return isNumeric(value) && data
            ? addDecimalsFormatNumber(value, data.asset.decimals)
            : null;
        }}
      />
      <AgGridColumn
        headerName="Created at"
        field="createdTimestamp"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<
          DepositFieldsFragment,
          'createdTimestamp'
        >) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '';
        }}
      />
      <AgGridColumn
        headerName="Status"
        field="status"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<DepositFieldsFragment, 'status'>) => {
          return value ? DepositStatusMapping[value] : '';
        }}
      />
      <AgGridColumn
        headerName="Tx hash"
        field="txHash"
        cellRenderer={({
          value,
          data,
        }: VegaICellRendererParams<DepositFieldsFragment, 'txHash'>) => {
          if (!data) return null;
          if (!value) return '-';
          return (
            <EtherscanLink tx={value} data-testid="etherscan-link">
              {truncateByChars(value)}
            </EtherscanLink>
          );
        }}
      />
    </AgGrid>
  );
});
