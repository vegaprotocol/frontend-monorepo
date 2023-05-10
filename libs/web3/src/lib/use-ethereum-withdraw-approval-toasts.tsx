import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { CopyWithTooltip, Icon } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { Panel } from '@vegaprotocol/ui-toolkit';
import { CLOSE_AFTER } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { useCallback } from 'react';
import compact from 'lodash/compact';
import type { EthWithdrawalApprovalState } from './use-ethereum-withdraw-approvals-store';
import { useEthWithdrawApprovalsStore } from './use-ethereum-withdraw-approvals-store';
import { ApprovalStatus } from './use-ethereum-withdraw-approvals-store';
import { VerificationStatus } from './withdrawal-approval-status';

const intentMap: { [s in ApprovalStatus]: Intent } = {
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Idle: Intent.None,
  Delayed: Intent.Warning,
  Ready: Intent.Success,
};

const EthWithdrawalApprovalToastContent = ({
  tx,
}: {
  tx: EthWithdrawalApprovalState;
}) => {
  let title = '';
  if (tx.status === ApprovalStatus.Error) {
    title = t('Error occurred');
  }
  if (tx.status === ApprovalStatus.Pending) {
    title = t('Pending approval');
  }
  if (tx.status === ApprovalStatus.Delayed) {
    title = t('Delayed');
  }
  if (tx.status === ApprovalStatus.Ready) {
    title = t('Approved');
  }
  const num = formatNumber(
    toBigNum(tx.withdrawal.amount, tx.withdrawal.asset.decimals),
    tx.withdrawal.asset.decimals
  );
  const details = (
    <Panel>
      <strong>
        {t('Withdraw')} {num} {tx.withdrawal.asset.symbol}
      </strong>
    </Panel>
  );
  const signatureBundleInfo = tx.approval?.signatures ? (
    <div className="mt-3">
      <p>{t('Please copy your signature...')}</p>
      <Panel
        className="flex align-middle max-w-full"
        title={tx.approval.signatures}
      >
        <div className="truncate text-ellipsis">{tx.approval.signatures}</div>
        <CopyWithTooltip text={tx.approval?.signatures}>
          <button
            data-testid="copy-withdrawal-signatures"
            className="underline"
          >
            <Icon name="duplicate" className="ml-2" />
          </button>
        </CopyWithTooltip>
      </Panel>
    </div>
  ) : (
    ''
  );

  return (
    <>
      {title.length > 0 && <ToastHeading>{title}</ToastHeading>}
      <VerificationStatus state={tx} />
      {details}
      {signatureBundleInfo}
    </>
  );
};

const isFinal = (tx: EthWithdrawalApprovalState) =>
  [ApprovalStatus.Ready, ApprovalStatus.Error].includes(tx.status);

export const useEthereumWithdrawApprovalsToasts = () => {
  const [setToast, remove] = useToasts((state) => [
    state.setToast,
    state.remove,
  ]);
  const [dismissTx, deleteTx] = useEthWithdrawApprovalsStore((state) => [
    state.dismiss,
    state.delete,
  ]);

  const fromWithdrawalApproval = useCallback(
    (tx: EthWithdrawalApprovalState): Toast => ({
      id: `withdrawal-${tx.id}`,
      intent: intentMap[tx.status],
      onClose: () => {
        if ([ApprovalStatus.Error, ApprovalStatus.Ready].includes(tx.status)) {
          deleteTx(tx.id);
        } else {
          dismissTx(tx.id);
        }
        remove(`withdrawal-${tx.id}`);
      },
      loader: tx.status === ApprovalStatus.Pending,
      content: <EthWithdrawalApprovalToastContent tx={tx} />,
      // TODO: Decide whether to make it dismissable manually or auto
      // closeAfter: isFinal(tx) ? CLOSE_AFTER : undefined,
      closeAfter: undefined,
    }),
    [deleteTx, dismissTx, remove]
  );

  useEthWithdrawApprovalsStore.subscribe(
    (state) =>
      compact(
        state.transactions.filter((transaction) => transaction?.dialogOpen)
      ),
    (txs) => {
      txs.forEach((tx) => {
        setToast(fromWithdrawalApproval(tx));
      });
    }
  );
};
