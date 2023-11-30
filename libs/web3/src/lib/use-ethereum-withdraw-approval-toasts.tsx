import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { Panel } from '@vegaprotocol/ui-toolkit';
import { CLOSE_AFTER } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { useCallback } from 'react';
import compact from 'lodash/compact';
import type { EthWithdrawalApprovalState } from './use-ethereum-withdraw-approvals-store';
import {
  useEthWithdrawApprovalsStore,
  WithdrawalFailure,
} from './use-ethereum-withdraw-approvals-store';
import { ApprovalStatus } from './use-ethereum-withdraw-approvals-store';
import { VerificationStatus } from './withdrawal-approval-status';
import { useT } from './use-t';

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
  const t = useT();
  const isConnectionFailure =
    tx.failureReason &&
    [
      WithdrawalFailure.WrongConnection,
      WithdrawalFailure.NoConnection,
    ].includes(tx.failureReason);

  let title = '';
  if (tx.status === ApprovalStatus.Error) {
    title = t('Error occurred');
  }
  if (tx.status === ApprovalStatus.Pending) {
    if (tx.failureReason && isConnectionFailure) {
      title = tx.message || t('Withdraw failure');
    } else {
      title = t('Pending approval');
    }
  }
  if (tx.status === ApprovalStatus.Delayed) {
    title = t('Delayed');
  }
  if (tx.status === ApprovalStatus.Ready) {
    title = t('Approved');
  }

  const amount = formatNumber(
    toBigNum(tx.withdrawal.amount, tx.withdrawal.asset.decimals),
    tx.withdrawal.asset.decimals
  );
  const details = isConnectionFailure ? null : (
    <Panel>
      <strong>
        {t('Withdraw {{amount}} {{symbol}}', {
          amount,
          symbol: tx.withdrawal.asset.symbol,
        })}
      </strong>
    </Panel>
  );

  return (
    <>
      {title.length > 0 && <ToastHeading>{title}</ToastHeading>}
      <VerificationStatus state={tx} />
      {details}
    </>
  );
};

const isFinal = (tx: EthWithdrawalApprovalState) =>
  [ApprovalStatus.Ready, ApprovalStatus.Error].includes(tx.status) &&
  !tx.failureReason;

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
    (tx: EthWithdrawalApprovalState): Toast => {
      const loader =
        tx.status === ApprovalStatus.Pending &&
        !(
          tx.failureReason &&
          [
            WithdrawalFailure.WrongConnection,
            WithdrawalFailure.NoConnection,
          ].includes(tx.failureReason)
        );
      return {
        id: `withdrawal-${tx.id}`,
        intent: intentMap[tx.status],
        onClose: () => {
          if (
            [ApprovalStatus.Error, ApprovalStatus.Ready].includes(tx.status)
          ) {
            deleteTx(tx.id);
          } else {
            dismissTx(tx.id);
          }
          remove(`withdrawal-${tx.id}`);
        },
        loader,
        content: <EthWithdrawalApprovalToastContent tx={tx} />,
        closeAfter: isFinal(tx) ? CLOSE_AFTER : undefined,
      };
    },
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
