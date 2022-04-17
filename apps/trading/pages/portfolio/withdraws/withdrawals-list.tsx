import {
  getDateTimeFormat,
  t,
  truncateByChars,
  EthTxStatus,
  formatNumber,
} from '@vegaprotocol/react-helpers';
import { WithdrawalStatus } from '@vegaprotocol/types';
import {
  EtherscanLink,
  TransactionDialog,
  AgGridDynamic as AgGrid,
} from '@vegaprotocol/ui-toolkit';
import { useCompleteWithdraw } from '@vegaprotocol/withdraws';
import type { ValueFormatterParams } from 'ag-grid-community';
import { AgGridColumn } from 'ag-grid-react';
import orderBy from 'lodash/orderBy';
import { useEffect, useMemo } from 'react';
import type { WithdrawsPage_party_withdrawals } from './__generated__/WithdrawsPage';

interface WithdrawalsListProps {
  withdrawals: WithdrawsPage_party_withdrawals[];
  refetchWithdrawals: () => void;
}

export const WithdrawalsList = ({
  withdrawals,
  refetchWithdrawals,
}: WithdrawalsListProps) => {
  const { transaction, submit } = useCompleteWithdraw();

  const sortedWithdrawals = useMemo(() => {
    return orderBy(
      withdrawals,
      (w) => {
        return new Date(w.createdTimestamp).getTime();
      },
      'desc'
    );
  }, [withdrawals]);

  // TODO: Get this working, sometimes the table doesnt update because we have to
  // deal with the delay whilst Vega picks up on the completed Ethereum transaction
  useEffect(() => {
    if (transaction.status === EthTxStatus.Complete) {
      refetchWithdrawals();
    }
  }, [transaction.status, refetchWithdrawals]);

  if (!sortedWithdrawals.length) {
    return <p>No pending withdrawals</p>;
  }

  return (
    <>
      <AgGrid
        rowData={sortedWithdrawals}
        overlayNoRowsTemplate={t('No withdrawals')}
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        components={{ StatusCell, RecipientCell }}
      >
        <AgGridColumn
          headerName="Amount"
          field="amount"
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            return formatNumber(value, data.asset.decimals);
          }}
        />
        <AgGridColumn
          headerName="Recipient"
          field="details.receiverAddress"
          cellRenderer="RecipientCell"
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
          cellRendererParams={{ complete: submit }}
        />
      </AgGrid>
      <TransactionDialog name="withdraw" {...transaction} />
    </>
  );
};

interface StatusCellProps extends ValueFormatterParams {
  complete: (withdrawalId: string) => void;
}

const StatusCell = ({ value, data, complete }: StatusCellProps) => {
  if (value === WithdrawalStatus.Finalized) {
    if (data.txHash) {
      return (
        <div className="flex justify-between">
          {t('Complete')}
          <EtherscanLink tx={data.txHash} text={t('View on Etherscan')} />
        </div>
      );
    } else {
      return (
        <div className="flex justify-between">
          {t('Ready')}
          <button className="underline" onClick={() => complete(data.id)}>
            Complete
          </button>
        </div>
      );
    }
  }

  return value;
};

// @ts-ignore valueFormatted not defined
const RecipientCell = ({ value, valueFormatted }: ValueFormatterParams) => {
  return <EtherscanLink address={value} text={valueFormatted} />;
};
