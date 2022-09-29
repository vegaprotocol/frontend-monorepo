import { AgGridColumn } from 'ag-grid-react';
import {
  t,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { DepositFieldsFragment } from './__generated__/Deposit';
import { useEnvironment } from '@vegaprotocol/environment';

export interface DepositsTableProps {
  deposits: DepositFieldsFragment[];
}

export const DepositsTable = ({ deposits }: DepositsTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  return (
    <AgGrid
      rowData={deposits}
      overlayNoRowsTemplate={t('No deposits')}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      suppressCellFocus={true}
    >
      <AgGridColumn headerName={t('Asset')} field="asset.symbol" />
      <AgGridColumn
        headerName={t('Amount')}
        field="amount"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<DepositFieldsFragment, 'amount'>) => {
          return addDecimalsFormatNumber(value, data.asset.decimals);
        }}
      />
      {/* TODO: "from address" is not available in the API */}
      <AgGridColumn headerName={t('From')} cellRenderer={() => '-'} />
      <AgGridColumn
        headerName={t('Completed')}
        field="createdTimestamp"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<
          DepositFieldsFragment,
          'createdTimestamp'
        >) => {
          return getDateTimeFormat().format(new Date(value));
        }}
      />
      <AgGridColumn
        headerName={t('Transaction')}
        field="txHash"
        cellRenderer={({
          value,
        }: VegaICellRendererParams<DepositFieldsFragment, 'txHash'>) => {
          if (!value) return '-';
          return (
            <ExternalLink
              href={`${ETHERSCAN_URL}/tx/${value}`}
              title={t('View transaction on Etherscan')}
              data-testid="etherscan-link"
            >
              {truncateByChars(value)}
            </ExternalLink>
          );
        }}
      />
    </AgGrid>
  );
};
