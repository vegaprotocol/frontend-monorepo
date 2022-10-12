import { AgGridColumn } from 'ag-grid-react';
import {
  getDateTimeFormat,
  t,
  truncateByChars,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { Link, AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import type { WithdrawalFields } from './__generated__/WithdrawalFields';
import { WithdrawalStatus } from '@vegaprotocol/types';

export const WithdrawalsTable = (props: TypedDataAgGrid<WithdrawalFields>) => {
  const { ETHERSCAN_URL } = useEnvironment();

  return (
    <AgGrid
      overlayNoRowsTemplate={t('No withdrawals')}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%' }}
      components={{ RecipientCell, StatusCell }}
      suppressCellFocus={true}
      domLayout="autoHeight"
      rowHeight={30}
      {...props}
    >
      <AgGridColumn headerName="Asset" field="asset.symbol" />
      <AgGridColumn
        headerName={t('Amount')}
        field="amount"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<WithdrawalFields, 'amount'>) => {
          return addDecimalsFormatNumber(value, data.asset.decimals);
        }}
      />
      <AgGridColumn
        headerName={t('Recipient')}
        field="details.receiverAddress"
        cellRenderer="RecipientCell"
        cellRendererParams={{ ethUrl: ETHERSCAN_URL }}
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<
          WithdrawalFields,
          'details.receiverAddress'
        >) => {
          if (!value) return '-';
          return truncateByChars(value);
        }}
      />
      <AgGridColumn
        headerName={t('Completed')}
        field="withdrawnTimestamp"
        valueFormatter={({
          data,
        }: VegaValueFormatterParams<
          WithdrawalFields,
          'withdrawnTimestamp'
        >) => {
          const ts = data.withdrawnTimestamp;
          if (!ts) return '-';
          return getDateTimeFormat().format(new Date(ts));
        }}
      />
      <AgGridColumn
        headerName={t('Status')}
        field="status"
        cellRenderer="StatusCell"
      />
      <AgGridColumn
        headerName={t('Transaction')}
        field="txHash"
        cellRenderer={({
          value,
        }: VegaValueFormatterParams<WithdrawalFields, 'txHash'>) => {
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

export const StatusCell = ({ data }: { data: WithdrawalFields }) => {
  if (data.pendingOnForeignChain || !data.txHash) {
    return <span>{t('Pending')}</span>;
  }
  if (data.status === WithdrawalStatus.STATUS_FINALIZED) {
    return <span>{t('Completed')}</span>;
  }
  if (data.status === WithdrawalStatus.STATUS_REJECTED) {
    return <span>{t('Rejected')}</span>;
  }
  return <span>{t('Failed')}</span>;
};

export interface RecipientCellProps
  extends VegaICellRendererParams<WithdrawalFields, 'details.receiverAddress'> {
  ethUrl: string;
}

const RecipientCell = ({
  ethUrl,
  value,
  valueFormatted,
}: RecipientCellProps) => {
  return (
    <Link
      title={t('View on Etherscan (opens in a new tab)')}
      href={`${ethUrl}/address/${value}`}
      data-testid="etherscan-link"
      target="_blank"
    >
      {valueFormatted}
    </Link>
  );
};
