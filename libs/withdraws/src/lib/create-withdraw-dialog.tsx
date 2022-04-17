import { Button, Icon, Loader } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { Erc20ApprovalPoll_erc20WithdrawalApproval } from './__generated__/Erc20ApprovalPoll';
import type { WithdrawTransactionArgs } from './use-complete-withdraw';

interface CreateWithdrawDialogProps {
  transaction: VegaTxState;
  finalizedApproval: Erc20ApprovalPoll_erc20WithdrawalApproval | null;
  completeWithdrawal: (args: WithdrawTransactionArgs) => void;
}

export const CreateWithdrawDialog = ({
  transaction,
  finalizedApproval,
  completeWithdrawal,
}: CreateWithdrawDialogProps) => {
  // TODO: When wallets support confirming transactions return UI for 'awaiting confirmation' step

  // Rejected by wallet
  if (transaction.status === VegaTxStatus.Error) {
    return (
      <CreateWithdrawDialogWrapper
        title="Withdrawal rejected by wallet"
        icon={<Icon name="warning-sign" size={20} />}
      >
        {transaction.error && (
          <pre className="text-ui break-all whitespace-pre-wrap">
            {JSON.stringify(transaction.error, null, 2)}
          </pre>
        )}
      </CreateWithdrawDialogWrapper>
    );
  }

  // Pending consensus
  if (!finalizedApproval) {
    return (
      <CreateWithdrawDialogWrapper
        title="Awaiting network confirmation"
        icon={<Loader size="small" />}
      >
        {transaction.txHash && (
          <p data-testid="tx-hash" className="break-all">
            {t(`Tx hash: ${transaction.txHash}`)}
          </p>
        )}
      </CreateWithdrawDialogWrapper>
    );
  }

  return (
    <CreateWithdrawDialogWrapper
      title="Withdrawal created"
      icon={<Icon name="tick" size={20} />}
    >
      <p>{t(`Amount: ${finalizedApproval.amount}`)}</p>
      <Button onClick={() => completeWithdrawal(finalizedApproval)}>
        Complete withdrawal
      </Button>
    </CreateWithdrawDialogWrapper>
  );
};

interface CreateWithdrawDialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

const CreateWithdrawDialogWrapper = ({
  children,
  icon,
  title,
}: CreateWithdrawDialogWrapperProps) => {
  return (
    <div className="flex gap-12 max-w-full">
      <div className="pt-8 fill-current">{icon}</div>
      <div data-testid="order-wrapper" className="flex-1">
        <h1 data-testid="order-status-header" className="text-h4">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};
