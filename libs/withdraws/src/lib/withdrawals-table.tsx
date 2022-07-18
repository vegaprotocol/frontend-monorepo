import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { AgGridColumn } from 'ag-grid-react';
import {
  getDateTimeFormat,
  t,
  truncateByChars,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import { WithdrawalStatus } from '@vegaprotocol/types';
import { Link, AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { TransactionDialog } from '@vegaprotocol/web3';
import { useCompleteWithdraw } from './use-complete-withdraw';
import type { Withdrawals_party_withdrawals } from './__generated__/Withdrawals';

export interface WithdrawalsTableProps {
  withdrawals: Withdrawals_party_withdrawals[];
}

export const WithdrawalsTable = ({ withdrawals }: WithdrawalsTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { transaction, submit } = useCompleteWithdraw(true);

  return (
    <>
      <AgGrid
        rowData={withdrawals}
        overlayNoRowsTemplate={t('No withdrawals')}
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        components={{ StatusCell, RecipientCell }}
        suppressCellFocus={true}
      >
        <AgGridColumn headerName="Asset" field="asset.symbol" />
        <AgGridColumn
          headerName="Amount"
          field="amount"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            return addDecimalsFormatNumber(value, data.asset.decimals);
          }}
        />
        <AgGridColumn
          headerName="Recipient"
          field="details.receiverAddress"
          cellRenderer="RecipientCell"
          cellRendererParams={{ ethUrl: ETHERSCAN_URL }}
          valueFormatter={({ value }: ValueFormatterParams) => {
            return truncateByChars(value);
          }}
        />
        <AgGridColumn
          headerName="Created at"
          field="createdTimestamp"
          valueFormatter={({ value }: ValueFormatterParams) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        <AgGridColumn
          headerName="Status"
          field="status"
          cellRenderer="StatusCell"
          cellRendererParams={{ complete: submit, ethUrl: ETHERSCAN_URL }}
        />
      </AgGrid>
      <TransactionDialog name="withdraw" {...transaction} />
    </>
  );
};

export interface StatusCellProps extends ICellRendererParams {
  ethUrl: string;
  complete: (withdrawalId: string) => void;
}

export const StatusCell = ({
  ethUrl,
  value,
  data,
  complete,
}: StatusCellProps) => {
  if (data.pendingOnForeignChain) {
    return (
      <div className="flex justify-between gap-8">
        {t('Pending')}
        {data.txHash && (
          <Link
            title={t('View transaction on Etherscan')}
            href={`${ethUrl}/tx/${data.txHash}`}
            data-testid="etherscan-link"
            target="_blank"
          >
            {t('View on Etherscan')}
          </Link>
        )}
      </div>
    );
  }

  if (value === WithdrawalStatus.Finalized) {
    return (
      <div className="flex justify-between gap-8">
        {data.txHash ? (
          <>
            {t('Finalized')}
            <Link
              title={t('View transaction on Etherscan')}
              href={`${ethUrl}/tx/${data.txHash}`}
              data-testid="etherscan-link"
              target="_blank"
            >
              {t('View on Etherscan')}
            </Link>
          </>
        ) : (
          <>
            {t('Open')}
            <button className="underline" onClick={() => complete(data.id)}>
              {t('Click to complete')}
            </button>
          </>
        )}
      </div>
    );
  }

  return value;
};

export interface RecipientCellProps extends ICellRendererParams {
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
