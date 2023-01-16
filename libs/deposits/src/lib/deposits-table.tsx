import { AgGridColumn } from 'ag-grid-react';
import {
  t,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
  isNumeric,
} from '@vegaprotocol/react-helpers';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid, Link } from '@vegaprotocol/ui-toolkit';
import type { DepositFieldsFragment } from './__generated__/Deposit';
import { useEnvironment } from '@vegaprotocol/environment';
import { DepositStatusMapping } from '@vegaprotocol/types';

export interface DepositsTableProps {
  deposits: DepositFieldsFragment[];
}

export const DepositsTable = ({ deposits }: DepositsTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  return (
    <AgGrid
      rowData={deposits}
      overlayNoRowsTemplate={t('No deposits')}
      enableCellTextSelection={true}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      suppressCellFocus={true}
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
        }: VegaICellRendererParams<DepositFieldsFragment, 'txHash'>) => {
          if (!value) return '-';
          return (
            <Link
              title={t('View transaction on Etherscan')}
              href={`${ETHERSCAN_URL}/tx/${value}`}
              data-testid="etherscan-link"
              target="_blank"
            >
              {truncateByChars(value)}
            </Link>
          );
        }}
      />
    </AgGrid>
  );
};
