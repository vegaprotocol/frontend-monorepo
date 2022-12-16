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
import { Button } from '@vegaprotocol/ui-toolkit';
import {
  Link,
  AgGridDynamic as AgGrid,
  Intent,
  Loader,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import type { VerifyState } from './use-verify-withdrawal';
import { ApprovalStatus } from './use-verify-withdrawal';

export const PendingWithdrawalsTable = (
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
      style={{ width: '100%' }}
      components={{ CompleteCell }}
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
        }: VegaValueFormatterParams<WithdrawalFieldsFragment, 'amount'>) => {
          return isNumeric(value) && data?.asset
            ? addDecimalsFormatNumber(value, data.asset.decimals)
            : null;
        }}
      />
      <AgGridColumn
        headerName={t('Recipient')}
        field="details.receiverAddress"
        cellRenderer={({
          ethUrl,
          value,
          valueFormatted,
        }: VegaICellRendererParams<
          WithdrawalFieldsFragment,
          'details.receiverAddress'
        > & {
          ethUrl: string;
        }) => (
          <Link
            title={t('View on Etherscan (opens in a new tab)')}
            href={`${ethUrl}/address/${value}`}
            data-testid="etherscan-link"
            target="_blank"
          >
            {valueFormatted}
          </Link>
        )}
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
        >) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '';
        }}
      />
      <AgGridColumn
        headerName=""
        field="status"
        flex={2}
        cellRendererParams={{
          complete: (withdrawal: WithdrawalFieldsFragment) => {
            createWithdrawApproval(withdrawal);
          },
        }}
        cellRenderer="CompleteCell"
      />
    </AgGrid>
  );
};

export type CompleteCellProps = {
  data: WithdrawalFieldsFragment;
  complete: (withdrawal: WithdrawalFieldsFragment) => void;
};
export const CompleteCell = ({ data, complete }: CompleteCellProps) => (
  <Button
    data-testid="complete-withdrawal"
    size="xs"
    onClick={() => complete(data)}
  >
    {t('Complete withdrawal')}
  </Button>
);

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
