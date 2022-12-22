import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { ETHERSCAN_TX, useEtherscanLink } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import {
  ExternalLink,
  Intent,
  ProgressBar,
  TransactionDetails,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useMemo } from 'react';
import compact from 'lodash/compact';
import type { EthStoredTxState } from '@vegaprotocol/web3';
import {
  EthTxStatus,
  isEthereumError,
  TransactionContent,
  useEthTransactionStore,
} from '@vegaprotocol/web3';

const intentMap: { [s in EthTxStatus]: Intent } = {
  Default: Intent.Primary,
  Requested: Intent.Warning,
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Complete: Intent.Success,
  Confirmed: Intent.Success,
};

const EthTransactionDetails = ({ tx }: { tx: EthStoredTxState }) => {
  const { data } = useAssetsDataProvider();
  if (!data) return null;

  const ETH_WITHDRAW =
    tx.methodName === 'withdraw_asset' && tx.args.length > 2 && tx.assetId;
  const ETH_DEPOSIT =
    tx.methodName === 'deposit_asset' && tx.args.length > 2 && tx.assetId;

  let label = '';
  if (ETH_WITHDRAW) label = t('Withdraw');
  if (ETH_DEPOSIT) label = t('Deposit');

  if (ETH_WITHDRAW || ETH_DEPOSIT) {
    const asset = data.find((a) => a.id === tx.assetId);

    if (asset) {
      return (
        <>
          <TransactionDetails label={label} amount={tx.args[1]} asset={asset} />
          {tx.requiresConfirmation &&
            [EthTxStatus.Pending].includes(tx.status) && (
              <div className="mt-[10px]">
                <span className="font-mono text-xs">
                  {t('Awaiting confirmations')}{' '}
                  {`(${tx.confirmations}/${tx.requiredConfirmations})`}
                </span>
                <ProgressBar
                  value={(tx.confirmations / tx.requiredConfirmations) * 100}
                  intent={Intent.Warning}
                />
              </div>
            )}
        </>
      );
    }
  }

  return null;
};

export const useEthereumTransactionToasts = () => {
  const ethTransactions = useEthTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissEthTransaction = useEthTransactionStore(
    (state) => state.dismiss
  );
  const etherscanLink = useEtherscanLink();
  const fromEthTransaction = useCallback(
    (tx: EthStoredTxState): Toast => {
      let toast: Partial<Toast> = {};
      const defaultValues = {
        id: `eth-${tx.id}`,
        intent: intentMap[tx.status],
        render: () => {
          return <TransactionContent {...tx} />;
        },
        onClose: () => dismissEthTransaction(tx.id),
      };
      if (tx.status === EthTxStatus.Requested) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Action required')}</h3>
                <p>
                  {t(
                    'Please go to your wallet application and approve or reject the transaction.'
                  )}
                </p>
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      if (tx.status === EthTxStatus.Pending) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Awaiting confirmation')}</h3>
                <p>{t('Please wait for your transaction to be confirmed')}</p>
                {tx.txHash && (
                  <p className="break-all">
                    <ExternalLink
                      href={etherscanLink(
                        ETHERSCAN_TX.replace(':hash', tx.txHash)
                      )}
                      rel="noreferrer"
                    >
                      {t('View on Etherscan')}
                    </ExternalLink>
                  </p>
                )}
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
          loader: true,
        };
      }
      if (
        tx.status === EthTxStatus.Confirmed ||
        tx.status === EthTxStatus.Complete
      ) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Transaction completed')}</h3>
                <p>{t('Your transaction has been completed')}</p>
                {tx.txHash && (
                  <p className="break-all">
                    <ExternalLink
                      href={etherscanLink(
                        ETHERSCAN_TX.replace(':hash', tx.txHash)
                      )}
                      rel="noreferrer"
                    >
                      {t('View on Etherscan')}
                    </ExternalLink>
                  </p>
                )}
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      if (tx.status === EthTxStatus.Error) {
        toast = {
          render: () => {
            let errorMessage = '';

            if (isEthereumError(tx.error)) {
              errorMessage = tx.error.reason;
            } else if (tx.error instanceof Error) {
              errorMessage = tx.error.message;
            }
            return (
              <div>
                <h3 className="font-bold">{t('Error occurred')}</h3>
                <p>{errorMessage}</p>
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      return {
        ...defaultValues,
        ...toast,
      };
    },
    [dismissEthTransaction, etherscanLink]
  );

  return useMemo(() => {
    return [...compact(ethTransactions).map(fromEthTransaction)];
  }, [ethTransactions, fromEthTransaction]);
};
