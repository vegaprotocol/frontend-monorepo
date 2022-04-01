import type { DepositEvent_busEvents_event_Deposit } from './__generated__/DepositEvent';
import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { TxState } from '../../../hooks/use-ethereum-transaction';
import { t } from '@vegaprotocol/react-helpers';

const ACTIVE_CLASSES = 'text-black dark:text-white';

export const ConfirmRow = ({ status }: { status: TxState }) => {
  if (status === TxState.Requested) {
    return (
      <p className="text-black dark:text-white">
        Confirm transaction in wallet
      </p>
    );
  }

  return <p>Confirmed in wallet</p>;
};

interface TxRowProps {
  status: TxState;
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
  const { chainId } = useWeb3React();

  if (status === TxState.Pending) {
    return (
      <p className={`flex justify-between ${ACTIVE_CLASSES}`}>
        <span>
          {t(
            `Awaiting Ethereum transaction ${confirmations}/${requiredConfirmations} confirmations...`
          )}
        </span>
        <EtherscanLink
          tx={txHash || ''}
          chainId={chainId || 3}
          className="underline text-vega-pink dark:text-vega-yellow"
          text={t('View on Etherscan')}
        />
      </p>
    );
  }

  if (status === TxState.Complete) {
    return (
      <p
        className={`flex justify-between ${
          highlightComplete ? ACTIVE_CLASSES : ''
        }`}
      >
        <span>{t('Ethereum transaction complete')}</span>
        <EtherscanLink
          tx={txHash || ''}
          chainId={chainId || 3}
          className="underline"
          text={t('View on Etherscan')}
        />
      </p>
    );
  }

  return <p>{t('Await Ethereum transaction')}</p>;
};

interface ConfirmationEventRowProps {
  status: TxState;
  confirmed: boolean;
}

export const ConfirmationEventRow = ({
  status,
  confirmed,
}: ConfirmationEventRowProps) => {
  if (status !== TxState.Complete) {
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
