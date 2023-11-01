import type { Asset } from '@vegaprotocol/assets';
import { EtherscanLink } from '@vegaprotocol/environment';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { EthTxStatus, useEthTransactionStore } from '@vegaprotocol/web3';
import { useGetFaucetError } from './get-faucet-error';
import { useT } from './use-t';
export interface FaucetNotificationProps {
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
  const t = useT();
  const tx = useEthTransactionStore((state) => {
    return state.transactions.find((t) => t?.id === faucetTxId);
  });
  const errorMessage = useGetFaucetError(
    tx?.status === EthTxStatus.Error ? tx.error : null,
    selectedAsset?.symbol
  );

  if (!isActive) {
    return null;
  }

  if (!selectedAsset) {
    return null;
  }

  if (!tx) {
    return null;
  }
  if (errorMessage) {
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
                  'Your request for funds from the {{assetSymbol}} faucet is being confirmed by the Ethereum network',
                  { assetSymbol: selectedAsset.symbol }
                )}{' '}
              </p>
              {tx.txHash && (
                <p>
                  <EtherscanLink tx={tx.txHash}>
                    {t('View on Etherscan')}
                  </EtherscanLink>
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
                  '{{assetSymbol}} has been deposited in your Ethereum wallet',
                  {
                    assetSymbol: selectedAsset.symbol,
                  }
                )}{' '}
              </p>
              {tx.txHash && (
                <p>
                  <EtherscanLink tx={tx.txHash}>
                    {t('View on Etherscan')}
                  </EtherscanLink>
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
