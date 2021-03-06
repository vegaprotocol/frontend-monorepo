import { Link, Dialog, Icon, Intent, Loader } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import type { EthTxState } from '@vegaprotocol/web3';
import { isEthereumError } from '@vegaprotocol/web3';
import { EthTxStatus } from '@vegaprotocol/web3';
import { t } from '@vegaprotocol/react-helpers';
import type { Erc20Approval_erc20WithdrawalApproval } from './__generated__/Erc20Approval';

export interface WithdrawDialogProps {
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
  const { ETHERSCAN_URL } = useEnvironment();
  const { intent, title, icon, children } = getProps(
    approval,
    vegaTx,
    ethTx,
    ETHERSCAN_URL
  );
  return (
    <Dialog
      open={dialogOpen}
      onChange={onDialogChange}
      intent={intent}
      title={title}
      icon={icon}
    >
      {children}
    </Dialog>
  );
};

interface StepProps {
  children: ReactNode;
}

const Step = ({ children }: StepProps) => {
  return (
    <p data-testid="dialog-text" className="flex justify-between">
      {children}
    </p>
  );
};

interface DialogProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  intent?: Intent;
}

const getProps = (
  approval: Erc20Approval_erc20WithdrawalApproval | null,
  vegaTx: VegaTxState,
  ethTx: EthTxState,
  ethUrl: string
) => {
  const vegaTxPropsMap: Record<VegaTxStatus, DialogProps> = {
    [VegaTxStatus.Default]: {
      title: '',
      icon: null,
      intent: undefined,
      children: null,
    },
    [VegaTxStatus.Error]: {
      title: t('Withdrawal transaction failed'),
      icon: <Icon name="warning-sign" size={20} />,
      intent: Intent.Danger,
      children: (
        <Step>
          <p>{vegaTx.error}</p>
        </Step>
      ),
    },
    [VegaTxStatus.Requested]: {
      title: t('Confirm withdrawal'),
      icon: <Icon name="hand-up" size={20} />,
      intent: Intent.Warning,
      children: <Step>Confirm withdrawal in Vega wallet</Step>,
    },
    [VegaTxStatus.Pending]: {
      title: t('Withdrawal transaction pending'),
      icon: <Loader size="small" />,
      intent: Intent.None,
      children: <Step>Awaiting transaction</Step>,
    },
    [VegaTxStatus.Complete]: {
      title: t('Withdrawal transaction complete'),
      icon: <Icon name="tick" />,
      intent: Intent.Success,
      children: <Step>Withdrawal created</Step>,
    },
  };

  const completeProps = {
    title: t('Withdrawal complete'),
    icon: <Icon name="tick" />,
    intent: Intent.Success,
    children: (
      <Step>
        <span>{t('Ethereum transaction complete')}</span>
        <Link
          href={`${ethUrl}/tx/${ethTx.txHash}`}
          title={t('View transaction on Etherscan')}
          className="text-vega-pink dark:text-vega-yellow"
          target="_blank"
        >
          {t('View on Etherscan')}
        </Link>
      </Step>
    ),
  };

  const ethTxPropsMap: Record<EthTxStatus, DialogProps> = {
    [EthTxStatus.Default]: {
      title: '',
      icon: null,
      intent: undefined,
      children: null,
    },
    [EthTxStatus.Error]: {
      title: t('Ethereum transaction failed'),
      icon: <Icon name="warning-sign" size={20} />,
      intent: Intent.Danger,
      children: (
        <Step>
          {isEthereumError(ethTx.error)
            ? `Error: ${ethTx.error.reason}`
            : ethTx.error instanceof Error
            ? t(`Error: ${ethTx.error.message}`)
            : t('Something went wrong')}
        </Step>
      ),
    },
    [EthTxStatus.Requested]: {
      title: t('Confirm transaction'),
      icon: <Icon name="hand-up" size={20} />,
      intent: Intent.Warning,
      children: <Step>{t('Confirm transaction in wallet')}</Step>,
    },
    [EthTxStatus.Pending]: {
      title: t('Ethereum transaction pending'),
      icon: <Loader size="small" />,
      intent: Intent.None,
      children: (
        <Step>
          <span>
            {t(
              `Awaiting Ethereum transaction ${ethTx.confirmations}/1 confirmations...`
            )}
          </span>
          <Link
            href={`${ethUrl}/tx/${ethTx.txHash}`}
            title={t('View transaction on Etherscan')}
            className="text-vega-pink dark:text-vega-yellow"
            target="_blank"
          >
            {t('View on Etherscan')}
          </Link>
        </Step>
      ),
    },
    [EthTxStatus.Complete]: completeProps,
    [EthTxStatus.Confirmed]: completeProps,
  };

  return approval ? ethTxPropsMap[ethTx.status] : vegaTxPropsMap[vegaTx.status];
};
