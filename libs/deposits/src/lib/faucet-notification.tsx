import type { Asset } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { EthTxStatus, useEthTransactionStore } from '@vegaprotocol/web3';
import { getFaucetError } from './get-faucet-error';

interface FaucetNotificationProps {
  isActive: boolean;
  selectedAsset?: Asset;
  faucetTxId: number | null;
}

/**
 * Render a notification for the faucet transaction
 */
export const FaucetNotification = ({
  isActive,
  selectedAsset,
  faucetTxId,
}: FaucetNotificationProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const tx = useEthTransactionStore((state) => {
    return state.transactions.find((t) => t?.id === faucetTxId);
  });

  if (!isActive) {
    return null;
  }

  if (!selectedAsset) {
    return null;
  }

  if (!tx) {
    return null;
  }

  if (tx.status === EthTxStatus.Error) {
    const errorMessage = getFaucetError(tx.error, selectedAsset.symbol);
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Danger}
          testId="faucet-error"
          message={errorMessage}
        />
      </div>
    );
  }

  if (tx.status === EthTxStatus.Requested) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="faucet-requested"
          message={t(
            `Confirm the transaction in your Ethereum wallet to use the ${selectedAsset?.symbol} faucet`
          )}
        />
      </div>
    );
  }

  if (tx.status === EthTxStatus.Pending) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Primary}
          testId="faucet-pending"
          message={
            <>
              <p className="mb-2">
                {t(
                  'Your request for funds from the %s faucet is being confirmed by the Ethereum network',
                  selectedAsset.symbol
                )}{' '}
              </p>
              {tx.txHash && (
                <p>
                  <ExternalLink href={`${ETHERSCAN_URL}/tx/${tx.txHash}`}>
                    {t('View on Etherscan')}
                  </ExternalLink>
                </p>
              )}
            </>
          }
        />
      </div>
    );
  }

  if (tx.status === EthTxStatus.Confirmed) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Success}
          testId="faucet-confirmed"
          message={
            <>
              <p className="mb-2">
                {t(
                  '%s has been deposited in your Ethereum wallet',
                  selectedAsset.symbol
                )}{' '}
              </p>
              {tx.txHash && (
                <p>
                  <ExternalLink href={`${ETHERSCAN_URL}/tx/${tx.txHash}`}>
                    {t('View on Etherscan')}
                  </ExternalLink>
                </p>
              )}
            </>
          }
        />
      </div>
    );
  }

  return null;
};
