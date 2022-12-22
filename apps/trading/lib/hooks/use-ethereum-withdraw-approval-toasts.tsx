import { t } from '@vegaprotocol/react-helpers';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Intent, TransactionDetails } from '@vegaprotocol/ui-toolkit';
import { ApprovalStatus, VerificationStatus } from '@vegaprotocol/withdraws';
import { useCallback, useMemo } from 'react';
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

export const useEthereumWithdrawApprovalsToasts = () => {
  const { withdrawApprovals, dismissWithdrawApproval } =
    useEthWithdrawApprovalsStore((state) => ({
      withdrawApprovals: state.transactions.filter(
        (transaction) => transaction?.dialogOpen
      ),
      dismissWithdrawApproval: state.dismiss,
    }));

  const fromWithdrawalApproval = useCallback(
    (tx: EthWithdrawalApprovalState): Toast => ({
      id: `withdrawal-${tx.id}`,
      intent: intentMap[tx.status],
      render: () => {
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
        return (
          <div>
            {title.length > 0 && <h3 className="font-bold">{title}</h3>}
            <VerificationStatus state={tx} />
            <TransactionDetails
              label={t('Withdraw')}
              amount={tx.withdrawal.amount}
              asset={tx.withdrawal.asset}
            />
          </div>
        );
      },
      onClose: () => dismissWithdrawApproval(tx.id),

      loader: tx.status === ApprovalStatus.Pending,
    }),
    [dismissWithdrawApproval]
  );

  const toasts = useMemo(() => {
    return [...compact(withdrawApprovals).map(fromWithdrawalApproval)];
  }, [fromWithdrawalApproval, withdrawApprovals]);

  return toasts;
};
