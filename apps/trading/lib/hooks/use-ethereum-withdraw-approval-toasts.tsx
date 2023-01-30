import { formatNumber, t, toBigNum } from '@vegaprotocol/react-helpers';
import type { Toast } from '@vegaprotocol/ui-toolkit';
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
  const num = formatNumber(
    toBigNum(tx.withdrawal.amount, tx.withdrawal.asset.decimals),
    tx.withdrawal.asset.decimals
  );
  const details = (
    <div className="mt-[5px]">
      <span className="font-mono text-xs p-1 bg-gray-100 rounded">
        {t('Withdraw')} {num} {tx.withdrawal.asset.symbol}
      </span>
    </div>
  );
  return (
    <div>
      {title.length > 0 && <h3 className="font-bold">{title}</h3>}
      <VerificationStatus state={tx} />
      {details}
    </div>
  );
};

export const useEthereumWithdrawApprovalsToasts = () => {
  const [setToast, remove] = useToasts((state) => [
    state.setToast,
    state.remove,
  ]);
  const dismissTx = useEthWithdrawApprovalsStore((state) => state.dismiss);

  const fromWithdrawalApproval = useCallback(
    (tx: EthWithdrawalApprovalState): Toast => ({
      id: `withdrawal-${tx.id}`,
      intent: intentMap[tx.status],
      onClose: () => {
        dismissTx(tx.id);
        remove(`withdrawal-${tx.id}`);
      },
      loader: tx.status === ApprovalStatus.Pending,
      content: <EthWithdrawalApprovalToastContent tx={tx} />,
    }),
    [dismissTx, remove]
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
