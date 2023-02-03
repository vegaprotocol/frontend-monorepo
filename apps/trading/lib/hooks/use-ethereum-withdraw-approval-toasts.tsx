import { formatNumber, t, toBigNum } from '@vegaprotocol/react-helpers';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Panel } from '@vegaprotocol/ui-toolkit';
import { CLOSE_AFTER } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { ApprovalStatus, VerificationStatus } from '@vegaprotocol/withdraws';
import { useCallback } from 'react';
import compact from 'lodash/compact';
import type { EthWithdrawalApprovalState } from '@vegaprotocol/web3';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';

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
      <b>
        {t('Withdraw')} {num} {tx.withdrawal.asset.symbol}
      </b>
    </Panel>
  );
  return (
    <>
      {title.length > 0 && <h3 className="font-bold">{title}</h3>}
      <VerificationStatus state={tx} />
      {details}
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
      closeAfter: isFinal(tx) ? CLOSE_AFTER : undefined,
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
