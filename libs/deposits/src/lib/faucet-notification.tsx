import type { Asset } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { EthTxStatus, useEthTransactionStore } from '@vegaprotocol/web3';

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
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Danger}
          testId="faucet-error"
          // @ts-ignore tx.error not typed correctly
          message={t(`Faucet failed: ${tx.error?.reason}`)}
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
            `Go to your Ethereum wallet and approve the faucet transaction for ${selectedAsset?.symbol}`
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
            <p>
              {t('Faucet pending...')}{' '}
              {tx.txHash && (
                <ExternalLink href={`${ETHERSCAN_URL}/tx/${tx.txHash}`}>
                  {t('View on Etherscan')}
                </ExternalLink>
              )}
            </p>
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
            <p>
              {t('Faucet successful')}{' '}
              {tx.txHash && (
                <ExternalLink href={`${ETHERSCAN_URL}/tx/${tx.txHash}`}>
                  {t('View on Etherscan')}
                </ExternalLink>
              )}
            </p>
          }
        />
      </div>
    );
  }

  return null;
};
