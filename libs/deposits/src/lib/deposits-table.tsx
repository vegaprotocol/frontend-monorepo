import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
  isNumeric,
} from '@vegaprotocol/utils';
import { type ColDef } from 'ag-grid-community';
import { AgGrid, COL_DEFS } from '@vegaprotocol/datagrid';
import {
  type VegaICellRendererParams,
  type VegaValueFormatterParams,
  type TypedDataAgGrid,
} from '@vegaprotocol/datagrid';
import { type DepositFieldsFragment } from './__generated__/Deposit';
import { EtherscanLink } from '@vegaprotocol/environment';
import { DepositStatusMapping } from '@vegaprotocol/types';
import { getAssetSymbol, type AssetFieldsFragment } from '@vegaprotocol/assets';

export const DepositsTable = (
  props: TypedDataAgGrid<DepositFieldsFragment>
) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Asset',
        field: 'asset',
        pinned: true,
        valueFormatter: ({ value }: { value: AssetFieldsFragment }) =>
          getAssetSymbol(value),
      },
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

          const chainId =
            data.asset.source.__typename === 'ERC20'
              ? Number(data.asset.source.chainId)
              : 1;

          return (
            <EtherscanLink
              tx={value}
              sourceChainId={chainId}
              data-testid="etherscan-link"
            >
              {truncateByChars(value)}
            </EtherscanLink>
          );
        },
      },
    ],
    []
  );
  return (
    <AgGrid
      columnDefs={columnDefs}
      defaultColDef={COL_DEFS.default}
      {...props}
    />
  );
};
