import {
  Dialog,
  EtherscanLink,
  Icon,
  Intent,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import type { EthTxState } from '@vegaprotocol/react-helpers';
import { t, EthTxStatus } from '@vegaprotocol/react-helpers';
import type { Erc20Approval_erc20WithdrawalApproval } from './__generated__/Erc20Approval';

interface WithdrawDialogProps {
  vegaTx: VegaTxState;
  ethTx: EthTxState;
  approval: Erc20Approval_erc20WithdrawalApproval | null;
  dialogOpen: boolean;
  onDialogChange: (isOpen: boolean) => void;
}

export const WithdrawDialog = ({
  vegaTx,
  ethTx,
  approval,
  dialogOpen,
  onDialogChange,
}: WithdrawDialogProps) => {
  const getProps = () => {
    let intent = Intent.Help;
    let props: DialogWrapperProps = {
      title: '',
      icon: null,
      children: null,
    };

    if (vegaTx.status === VegaTxStatus.Error) {
      props = {
        title: t('Vega transaction failed'),
        icon: <Icon name="warning-sign" size={20} />,
        children: (
          <Step>
            {vegaTx.error && (
              <pre className="text-ui break-all whitespace-pre-wrap">
                {JSON.stringify(vegaTx.error, null, 2)}
              </pre>
            )}
          </Step>
        ),
      };
      intent = Intent.Danger;
    }

    // TODO: Add separate UI for when VegaTxStatus is Requested
    // UI should direct user to their wallet to confirm tx.
    const isPending =
      vegaTx.status === VegaTxStatus.Pending ||
      vegaTx.status === VegaTxStatus.Requested;

    if (isPending || !approval) {
      props = {
        title: t('Withdrawal transaction pending'),
        icon: <Loader size="small" />,
        children: <Step>Awaiting transaction</Step>,
      };
      intent = Intent.Progress;
    }

    if (ethTx.status === EthTxStatus.Error) {
      props = {
        title: t('Ethereum transaction failed'),
        icon: <Icon name="warning-sign" />,
        children: (
          <Step>
            {ethTx.error ? ethTx.error.message : t('Something went wrong')}
          </Step>
        ),
      };
      intent = Intent.Danger;
    }

    if (ethTx.status === EthTxStatus.Requested) {
      props = {
        title: t('Confirm Ethereum transaction'),
        icon: <Icon name="hand-up" />,
        children: <Step>{t('Confirm transaction in wallet')}</Step>,
      };
      intent = Intent.Prompt;
    }

    if (ethTx.status === EthTxStatus.Pending) {
      props = {
        title: t('Ethereum transaction pending'),
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
      intent = Intent.Progress;
    }

    if (ethTx.status === EthTxStatus.Complete) {
      props = {
        title: 'Withdrawal complete',
        icon: <Icon name="tick" />,
        children: (
          <Step>
            <span>{t('Ethereum transaction complete')}</span>
            <EtherscanLink
              tx={ethTx.txHash || ''}
              className="text-vega-pink dark:text-vega-yellow"
              text={t('View on Etherscan')}
            />
          </Step>
        ),
      };
      intent = Intent.Success;
    }

    return { props, intent };
  };

  const { intent, props } = getProps();

  return (
    <Dialog open={dialogOpen} intent={intent} onChange={onDialogChange}>
      <DialogWrapper {...props} />
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
}

const Step = ({ children }: StepProps) => {
  return <p className="flex justify-between">{children}</p>;
};
