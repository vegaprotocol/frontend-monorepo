import { AgGridColumn } from 'ag-grid-react';
import {
  getDateTimeFormat,
  t,
  truncateByChars,
  addDecimalsFormatNumber,
} from '@vegaprotocol/react-helpers';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import {
  ButtonLink,
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

export interface WithdrawalsTableProps {
  withdrawals: WithdrawalFields[];
}

export const WithdrawalsTable = ({ withdrawals }: WithdrawalsTableProps) => {
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
        rowData={withdrawals}
        overlayNoRowsTemplate={t('No withdrawals')}
        defaultColDef={{ flex: 1, resizable: true }}
        style={{ width: '100%', height: '100%' }}
        components={{ StatusCell, RecipientCell }}
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
          headerName={t('Created at')}
          field="createdTimestamp"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<
            WithdrawalFields,
            'createdTimestamp'
          >) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
        <AgGridColumn
          headerName={t('TX hash')}
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
        <AgGridColumn
          headerName={t('Status')}
          field="status"
          cellRenderer="StatusCell"
          cellRendererParams={{
            complete: async (withdrawal: WithdrawalFields) => {
              const verified = await verify(withdrawal);

              if (!verified) {
                return;
              }

              submit(withdrawal.id);
            },
            ethUrl: ETHERSCAN_URL,
          }}
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

export interface StatusCellProps
  extends VegaICellRendererParams<WithdrawalFields, 'status'> {
  ethUrl: string;
  complete: (withdrawal: WithdrawalFields) => void;
}

export const StatusCell = ({ ethUrl, data, complete }: StatusCellProps) => {
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

  if (!data.txHash) {
    return (
      <div className="flex justify-between gap-8">
        {t('Open')}
        <ButtonLink onClick={() => complete(data)}>{t('Complete')}</ButtonLink>
      </div>
    );
  }

  return <span>{t('Finalized')}</span>;
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
