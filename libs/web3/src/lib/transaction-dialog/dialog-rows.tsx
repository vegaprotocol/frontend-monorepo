import { t } from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import { EthTxStatus } from '../use-ethereum-transaction';

const ACTIVE_CLASSES = 'text-black dark:text-white';

export const ConfirmRow = ({ status }: { status: EthTxStatus }) => {
  if (status === EthTxStatus.Requested) {
    return (
      <p className="text-black dark:text-white">
        {t('Confirm transaction in wallet')}
      </p>
    );
  }

  return <p>{t('Confirmed in wallet')}</p>;
};

interface TxRowProps {
  status: EthTxStatus;
  txHash: string | null;
  confirmations: number;
  requiredConfirmations: number;
  highlightComplete?: boolean;
}

export const TxRow = ({
  status,
  txHash,
  confirmations,
  requiredConfirmations,
  highlightComplete = true,
}: TxRowProps) => {
  if (status === EthTxStatus.Pending) {
    return (
      <p className={`flex justify-between ${ACTIVE_CLASSES}`}>
        <span>
          {t(
            `Awaiting Ethereum transaction ${confirmations}/${requiredConfirmations} confirmations...`
          )}
        </span>
        <Link
          data-testid="etherscan-link"
          href={`${process.env['ETHERSCAN_URL']}/tx/${txHash}`}
          title={t('View transaction on Etherscan')}
          className="text-vega-pink dark:text-vega-yellow"
        >
          {t('View on Etherscan')}
        </Link>
      </p>
    );
  }

  if (status === EthTxStatus.Complete) {
    return (
      <p
        className={`flex justify-between ${
          highlightComplete ? ACTIVE_CLASSES : ''
        }`}
      >
        <span>{t('Ethereum transaction complete')}</span>
        <Link
          href={`${process.env['NX_ETHERSCAN_URL']}/tx/${txHash}`}
          title={t('View on Etherscan')}
          className="text-vega-pink dark:text-vega-yellow"
        >
          {t('View transaction on Etherscan')}
        </Link>
      </p>
    );
  }

  return <p>{t('Await Ethereum transaction')}</p>;
};

interface ConfirmationEventRowProps {
  status: EthTxStatus;
  confirmed: boolean;
}

export const ConfirmationEventRow = ({
  status,
  confirmed,
}: ConfirmationEventRowProps) => {
  if (status !== EthTxStatus.Complete) {
    return <p>{t('Vega confirmation')}</p>;
  }

  if (!confirmed) {
    return (
      <p className="text-black dark:text-white">
        {t('Vega is confirming your transaction...')}
      </p>
    );
  }

  return (
    <p className="text-black dark:text-white">{t('Transaction confirmed')}</p>
  );
};
