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
import { Button } from '@vegaprotocol/ui-toolkit';
import {
  Dialog,
  Link,
  AgGridDynamic as AgGrid,
  Intent,
  Loader,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { useCompleteWithdraw } from './use-complete-withdraw';
import type { WithdrawalFields } from './__generated__/WithdrawalFields';
import type { VerifyState } from './use-verify-withdrawal';
import { ApprovalStatus, useVerifyWithdrawal } from './use-verify-withdrawal';

export const PendingWithdrawalsTable = (
  props: TypedDataAgGrid<WithdrawalFields>
) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const {
    submit,
    reset: resetTx,
    Dialog: EthereumTransactionDialog,
  } = useCompleteWithdraw();
  const {
    verify,
    state: verifyState,
    reset: resetVerification,
  } = useVerifyWithdrawal();

  return (
    <>
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
          }: VegaValueFormatterParams<WithdrawalFields, 'amount'>) => {
            return value && data?.asset
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
            WithdrawalFields,
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
            WithdrawalFields,
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
            WithdrawalFields,
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
            complete: async (withdrawal: WithdrawalFields) => {
              const verified = await verify(withdrawal);

              if (!verified) {
                return;
              }

              submit(withdrawal.id);
            },
          }}
          cellRenderer="CompleteCell"
        />
      </AgGrid>
      <Dialog
        title={t('Withdrawal verification')}
        onChange={(isOpen) => {
          if (!isOpen) {
            resetTx();
            resetVerification();
          }
        }}
        open={verifyState.dialogOpen}
        size="small"
        {...getVerifyDialogProps(verifyState.status)}
      >
        <VerificationStatus state={verifyState} />
      </Dialog>
      <EthereumTransactionDialog />
    </>
  );
};

export type CompleteCellProps = {
  data: WithdrawalFields;
  complete: (withdrawal: WithdrawalFields) => void;
};
export const CompleteCell = ({ data, complete }: CompleteCellProps) => (
  <Button size="xs" onClick={() => complete(data)}>
    {t('Complete withdrawal')}
  </Button>
);

const getVerifyDialogProps = (status: ApprovalStatus) => {
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

const VerificationStatus = ({ state }: { state: VerifyState }) => {
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
