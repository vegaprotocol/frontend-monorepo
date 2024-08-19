import { Link } from '@vegaprotocol/ui-toolkit';
import { BlockExplorerLink, useEnvironment } from '@vegaprotocol/environment';
import { EthTxStatus } from '../use-ethereum-transaction';
import { useT } from '../use-t';

const ACTIVE_CLASSES = 'text-black dark:text-white';

export const ConfirmRow = ({ status }: { status: EthTxStatus }) => {
  const t = useT();
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
  const t = useT();
  const { ETHERSCAN_URL } = useEnvironment();

  if (status === EthTxStatus.Pending) {
    return (
      <p className={`flex justify-between ${ACTIVE_CLASSES}`}>
        <span>
          {t(
            `Awaiting Ethereum transaction {{confirmations}}/{{requiredConfirmations}} confirmations...`,
            { confirmations, requiredConfirmations }
          )}
        </span>
        <Link
          href={`${ETHERSCAN_URL}/tx/${txHash}`}
          title={t('View transaction on Etherscan')}
          className="text-pink dark:text-yellow"
          target="_blank"
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
        {txHash && (
          <BlockExplorerLink tx={txHash} className="text-pink dark:text-yellow">
            {t('View transaction on Etherscan')}
          </BlockExplorerLink>
        )}
      </p>
    );
  }

  return <p>{t('Await Ethereum transaction')}</p>;
};

interface ConfirmationEventRowProps {
  status: EthTxStatus;
}

export const ConfirmationEventRow = ({ status }: ConfirmationEventRowProps) => {
  const t = useT();
  if (status !== EthTxStatus.Complete && status !== EthTxStatus.Confirmed) {
    return <p>{t('Vega confirmation')}</p>;
  }

  if (status === EthTxStatus.Complete) {
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
