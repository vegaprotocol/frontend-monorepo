import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import {
  getDateTimeFormat,
  truncateByChars,
  addDecimalsFormatNumber,
  isNumeric,
} from '@vegaprotocol/utils';
import { useBottomPlaceholder } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import { Link, ButtonLink } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/datagrid';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { useEnvironment } from '@vegaprotocol/environment';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';
import * as Schema from '@vegaprotocol/types';
import type { VerifyState } from './use-verify-withdrawal';
import { ApprovalStatus } from './use-verify-withdrawal';

export const WithdrawalsTable = (
  props: TypedDataAgGrid<WithdrawalFieldsFragment>
) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { ETHERSCAN_URL } = useEnvironment();
  const createWithdrawApproval = useEthWithdrawApprovalsStore(
    (store) => store.create
  );

  const bottomPlaceholderProps = useBottomPlaceholder({ gridRef });
  return (
    <AgGrid
      overlayNoRowsTemplate={t('No withdrawals')}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      components={{
        RecipientCell,
        StatusCell,
        EtherscanLinkCell,
        CompleteCell,
      }}
      suppressCellFocus
      ref={gridRef}
      {...bottomPlaceholderProps}
      {...props}
    >
      <AgGridColumn headerName="Asset" field="asset.symbol" />
      <AgGridColumn
        headerName={t('Amount')}
        field="amount"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<WithdrawalFieldsFragment, 'amount'>) => {
          return isNumeric(value) && data?.asset
            ? addDecimalsFormatNumber(value, data.asset.decimals)
            : '';
        }}
      />
      <AgGridColumn
        headerName={t('Recipient')}
        field="details.receiverAddress"
        cellRenderer="RecipientCell"
        cellRendererParams={{ ethUrl: ETHERSCAN_URL }}
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'details.receiverAddress'
        >) => {
          if (!data) return null;
          if (!value) return '-';
          return truncateByChars(value);
        }}
      />
      <AgGridColumn
        headerName={t('Created')}
        field="createdTimestamp"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'createdTimestamp'
        >) =>
          data
            ? value
              ? getDateTimeFormat().format(new Date(value))
              : '-'
            : null
        }
      />
      <AgGridColumn
        headerName={t('Completed')}
        field="withdrawnTimestamp"
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'withdrawnTimestamp'
        >) =>
          data
            ? value
              ? getDateTimeFormat().format(new Date(value))
              : '-'
            : null
        }
      />
      <AgGridColumn
        headerName={t('Status')}
        field="status"
        cellRenderer="StatusCell"
      />
      <AgGridColumn
        headerName={t('Transaction')}
        field="txHash"
        flex={2}
        cellRendererParams={{
          complete: (withdrawal: WithdrawalFieldsFragment) => {
            createWithdrawApproval(withdrawal);
          },
          ethUrl: ETHERSCAN_URL,
        }}
        cellRendererSelector={({
          data,
        }: VegaICellRendererParams<WithdrawalFieldsFragment>) => ({
          component: data?.txHash ? 'EtherscanLinkCell' : 'CompleteCell',
        })}
      />
    </AgGrid>
  );
};

export type CompleteCellProps = {
  data: WithdrawalFieldsFragment;
  complete: (withdrawal: WithdrawalFieldsFragment) => void;
};
export const CompleteCell = ({ data, complete }: CompleteCellProps) => {
  if (!data) {
    return null;
  }
  return data.pendingOnForeignChain ? (
    '-'
  ) : (
    <ButtonLink
      data-testid="complete-withdrawal"
      onClick={() => complete(data)}
    >
      {t('Complete withdrawal')}
    </ButtonLink>
  );
};

export const EtherscanLinkCell = ({
  value,
  ethUrl,
}: VegaValueFormatterParams<WithdrawalFieldsFragment, 'txHash'> & {
  ethUrl: string;
}) => {
  if (!value) return '-';
  return (
    <Link
      title={t('View transaction on Etherscan')}
      href={`${ethUrl}/tx/${value}`}
      data-testid="etherscan-link"
      target="_blank"
    >
      {truncateByChars(value)}
    </Link>
  );
};

export const StatusCell = ({ data }: { data: WithdrawalFieldsFragment }) => {
  if (!data) {
    return null;
  }
  if (data.pendingOnForeignChain || !data.txHash) {
    return <span>{t('Pending')}</span>;
  }
  if (data.status === Schema.WithdrawalStatus.STATUS_FINALIZED) {
    return <span>{t('Completed')}</span>;
  }
  if (data.status === Schema.WithdrawalStatus.STATUS_REJECTED) {
    return <span>{t('Rejected')}</span>;
  }
  return <span>{t('Failed')}</span>;
};

export interface RecipientCellProps
  extends VegaICellRendererParams<
    WithdrawalFieldsFragment,
    'details.receiverAddress'
  > {
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

export const VerificationStatus = ({ state }: { state: VerifyState }) => {
  if (state.status === ApprovalStatus.Error) {
    return <p>{state.message || t('Something went wrong')}</p>;
  }

  if (state.status === ApprovalStatus.Pending) {
    return <p>{t('Verifying...')}</p>;
  }

  if (state.status === ApprovalStatus.Delayed && state.completeTimestamp) {
    const formattedTime = getDateTimeFormat().format(
      new Date(state.completeTimestamp)
    );
    return (
      <>
        <p>{t("The amount you're withdrawing has triggered a time delay")}</p>
        <p>{t(`Cannot be completed until ${formattedTime}`)}</p>
      </>
    );
  }

  if (state.status === ApprovalStatus.Ready) {
    return <p>{t('The withdrawal has been approved.')}</p>;
  }

  return null;
};
