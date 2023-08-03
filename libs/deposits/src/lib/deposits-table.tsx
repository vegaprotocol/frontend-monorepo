import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
  isNumeric,
} from '@vegaprotocol/utils';
import type { ColDef } from 'ag-grid-community';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
  TypedDataAgGrid,
} from '@vegaprotocol/datagrid';
import type { DepositFieldsFragment } from './__generated__/Deposit';
import { EtherscanLink } from '@vegaprotocol/environment';
import { DepositStatusMapping } from '@vegaprotocol/types';

export const DepositsTable = (
  props: TypedDataAgGrid<DepositFieldsFragment>
) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: 'Asset', field: 'asset.symbol' },
      {
        headerName: 'Amount',
        field: 'amount',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<DepositFieldsFragment, 'amount'>) => {
          return isNumeric(value) && data
            ? addDecimalsFormatNumber(value, data.asset.decimals)
            : '';
        },
      },
      {
        headerName: 'Created at',
        field: 'createdTimestamp',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          DepositFieldsFragment,
          'createdTimestamp'
        >) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '';
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<DepositFieldsFragment, 'status'>) => {
          return value ? DepositStatusMapping[value] : '';
        },
      },
      {
        headerName: 'Tx hash',
        field: 'txHash',
        cellRenderer: ({
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
        },
        flex: 1,
      },
    ],
    []
  );
  return (
    <AgGrid
      defaultColDef={{ flex: 1 }}
      columnDefs={columnDefs}
      style={{ width: '100%', height: '100%' }}
      {...props}
    />
  );
};
