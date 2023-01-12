import { AgGridColumn } from 'ag-grid-react';
import {
  getDateTimeFormat,
  t,
  truncateByChars,
  addDecimalsFormatNumber,
  isNumeric,
} from '@vegaprotocol/react-helpers';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import {
  Link,
  ButtonLink,
  AgGridDynamic as AgGrid,
  Intent,
  Icon,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';
import * as Schema from '@vegaprotocol/types';
import type { VerifyState } from './use-verify-withdrawal';
import { ApprovalStatus } from './use-verify-withdrawal';

export const WithdrawalsTable = (
  props: TypedDataAgGrid<WithdrawalFieldsFragment>
) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const createWithdrawApproval = useEthWithdrawApprovalsStore(
    (store) => store.create
  );

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
      suppressCellFocus={true}
      domLayout="autoHeight"
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
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'details.receiverAddress'
        >) => {
          if (!value) return '-';
          return truncateByChars(value);
        }}
      />
      <AgGridColumn
        headerName={t('Created')}
        field="createdTimestamp"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'createdTimestamp'
        >) => (value ? getDateTimeFormat().format(new Date(value)) : '-')}
      />
      <AgGridColumn
        headerName={t('Completed')}
        field="withdrawnTimestamp"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<
          WithdrawalFieldsFragment,
          'withdrawnTimestamp'
        >) => (value ? getDateTimeFormat().format(new Date(value)) : '-')}
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
export const CompleteCell = ({ data, complete }: CompleteCellProps) =>
  data.pendingOnForeignChain ? (
    '-'
  ) : (
    <ButtonLink
      data-testid="complete-withdrawal"
      onClick={() => complete(data)}
    >
      {t('Complete withdrawal')}
    </ButtonLink>
  );

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

export const getVerifyDialogProps = (status: ApprovalStatus) => {
  if (status === ApprovalStatus.Error) {
    return {
      intent: Intent.Danger,
      icon: <Icon name="warning-sign" />,
    };
  }

  if (status === ApprovalStatus.Pending) {
    return { intent: Intent.None, icon: <Loader size="small" /> };
  }

  if (status === ApprovalStatus.Delayed) {
    return { intent: Intent.Warning, icon: <Icon name="time" /> };
  }

  return { intent: Intent.None };
};

export const VerificationStatus = ({ state }: { state: VerifyState }) => {
  if (state.status === ApprovalStatus.Error) {
    return <p>{t('Something went wrong')}</p>;
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
        <p className="mb-2">
          {t("The amount you're withdrawing has triggered a time delay")}
        </p>
        <p>{t(`Cannot be completed until ${formattedTime}`)}</p>
      </>
    );
  }

  return null;
};
