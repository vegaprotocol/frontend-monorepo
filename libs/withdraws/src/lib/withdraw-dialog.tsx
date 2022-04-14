import {
  Dialog,
  EtherscanLink,
  Icon,
  Intent,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import type { TransactionState } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { useCompleteWithdraw } from './use-complete-withdraw';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRef, useState } from 'react';
import type { Erc20ApprovalPoll_erc20WithdrawalApproval } from './__generated__/Erc20ApprovalPoll';
import {
  isExpectedEthereumError,
  t,
  TxState,
} from '@vegaprotocol/react-helpers';

interface WithdrawDialogProps {
  vegaTx: TransactionState;
  ethTx: ReturnType<typeof useCompleteWithdraw>;
  approval: Erc20ApprovalPoll_erc20WithdrawalApproval | null;
}

export const WithdrawDialog = ({
  vegaTx,
  ethTx,
  approval,
}: WithdrawDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogDismissed = useRef(false);

  const getWrapperProps = () => {
    // eslint-disable-next-line
    let props: any = {
      title: '',
      intent: undefined,
      icon: null,
      children: null,
    };
    if (vegaTx.status === VegaTxStatus.Rejected) {
      props = {
        title: t('Vega transaction failed'),
        intent: Intent.Danger,
        icon: <Icon name="warning-sign" size={20} />,
        children: (
          <Step active={true}>
            {vegaTx.error && (
              <pre className="text-ui break-all whitespace-pre-wrap">
                {JSON.stringify(vegaTx.error, null, 2)}
              </pre>
            )}
          </Step>
        ),
      };
    }

    if (vegaTx.status === VegaTxStatus.AwaitingConfirmation) {
      props = {
        title: t('Confirm Vega transaction'),
        intent: Intent.Prompt,
        icon: <Icon name="hand-up" size={20} />,
        children: <Step active={true}>Confirm in Vega wallet</Step>,
      };
    }

    if (vegaTx.status === VegaTxStatus.Pending || !approval) {
      props = {
        title: t('Withdrawal transaction pending'),
        intent: Intent.Progress,
        icon: <Loader size="small" />,
        children: <Step active={true}>Awaiting transaction</Step>,
      };
    }

    if (ethTx.status === TxState.Error) {
      props = {
        title: t('Ethereum transaction failed'),
        intent: Intent.Danger,
        icon: <Icon name="warning-sign" />,
        children: (
          <Step active={true}>
            {ethTx.error ? ethTx.error.message : t('Something went wrong')}
          </Step>
        ),
      };
    }

    if (ethTx.status === TxState.Requested) {
      props = {
        title: t('Confirm Ethereum transaction'),
        intent: Intent.Prompt,
        icon: <Icon name="hand-up" />,
        children: (
          <Step active={true}>{t('Confirm transaction in wallet')}</Step>
        ),
      };
    }

    if (ethTx.status === TxState.Pending) {
      props = {
        title: t('Ethereum transaction pending'),
        intent: Intent.Progress,
        icon: <Loader size="small" />,
        children: (
          <Step>
            <span>
              {t(
                `Awaiting Ethereum transaction ${ethTx.confirmations}/1 confirmations...`
              )}
            </span>
            <EtherscanLink
              tx={ethTx.txHash || ''}
              className="text-vega-pink dark:text-vega-yellow"
              text={t('View on Etherscan')}
            />
          </Step>
        ),
      };
    }

    if (ethTx.status === TxState.Complete) {
      props = {
        title: 'Withdrawal complete',
        intent: Intent.Success,
        icon: <Icon name="tick" />,
        children: <Step active={true}>{t('Withdrawal complete')}</Step>,
      };
    }

    return props;
  };

  // Control dialog open state
  useEffect(() => {
    // Close dialog if error is due to user rejecting the tx
    if (
      ethTx.status === TxState.Error &&
      isExpectedEthereumError(ethTx.error)
    ) {
      setDialogOpen(false);
      return;
    }

    // Open when the vega tx is started
    if (vegaTx.status !== VegaTxStatus.Default && !dialogDismissed.current) {
      setDialogOpen(true);
      return;
    }
  }, [vegaTx, ethTx]);

  const { intent, title, ...wrapperProps } = getWrapperProps();

  return (
    <Dialog
      open={dialogOpen}
      title={title}
      intent={intent}
      onChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (!isOpen) {
          dialogDismissed.current = true;
        }
      }}
    >
      <DialogWrapper {...wrapperProps} />
    </Dialog>
  );
};

interface DialogWrapperProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

export const DialogWrapper = ({
  children,
  icon,
  title,
}: DialogWrapperProps) => {
  return (
    <div className="flex gap-12 max-w-full text-ui">
      <div className="pt-8 fill-current">{icon}</div>
      <div className="flex-1">
        <h1 className="text-h4 text-black dark:text-white capitalize mb-12">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

interface StepProps {
  children: ReactNode;
  active?: boolean;
}

const Step = ({ children, active = false }: StepProps) => {
  const className = active
    ? 'text-black dark:text-white'
    : 'text-black-40 dark:text-white-40';
  return <p className={className}>{children}</p>;
};
