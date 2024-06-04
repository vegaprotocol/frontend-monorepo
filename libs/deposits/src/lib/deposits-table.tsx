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

export const DepositsTable = (
  props: TypedDataAgGrid<DepositFieldsFragment>
) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: 'Asset', field: 'asset.symbol', pinned: true },
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

          const assetChainId =
            data.asset.source.__typename === 'ERC20'
              ? Number(data.asset.source.chainId)
              : undefined;

          return (
            <EtherscanLink
              sourceChainId={assetChainId}
              tx={value}
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
