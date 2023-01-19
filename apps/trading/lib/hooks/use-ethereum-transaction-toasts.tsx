import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { ETHERSCAN_TX, useEtherscanLink } from '@vegaprotocol/environment';
import { formatNumber, t, toBigNum } from '@vegaprotocol/react-helpers';
import type { Toast, ToastContent } from '@vegaprotocol/ui-toolkit';
import { ExternalLink, Intent, ProgressBar } from '@vegaprotocol/ui-toolkit';
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
      const num = formatNumber(
        toBigNum(tx.args[1], asset.decimals),
        asset.decimals
      );
      const details = (
        <div className="mt-[5px]">
          <span className="font-mono text-xs p-1 bg-gray-100 rounded">
            {label} {num} {asset.symbol}
          </span>
        </div>
      );
      return (
        <>
          {details}
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

type EthTxToastContentProps = {
  tx: EthStoredTxState;
};

const EthTxRequestedToastContent = ({ tx }: EthTxToastContentProps) => {
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
};

const EthTxPendingToastContent = ({ tx }: EthTxToastContentProps) => {
  const etherscanLink = useEtherscanLink();
  return (
    <div>
      <h3 className="font-bold">{t('Awaiting confirmation')}</h3>
      <p>{t('Please wait for your transaction to be confirmed')}</p>
      {tx.txHash && (
        <p className="break-all">
          <ExternalLink
            href={etherscanLink(ETHERSCAN_TX.replace(':hash', tx.txHash))}
            rel="noreferrer"
          >
            {t('View on Etherscan')}
          </ExternalLink>
        </p>
      )}
      <EthTransactionDetails tx={tx} />
    </div>
  );
};

const EthTxErrorToastContent = ({ tx }: EthTxToastContentProps) => {
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
};

const EthTxConfirmedToastContent = ({ tx }: EthTxToastContentProps) => {
  const etherscanLink = useEtherscanLink();
  return (
    <div>
      <h3 className="font-bold">{t('Transaction completed')}</h3>
      <p>{t('Your transaction has been completed')}</p>
      {tx.txHash && (
        <p className="break-all">
          <ExternalLink
            href={etherscanLink(ETHERSCAN_TX.replace(':hash', tx.txHash))}
            rel="noreferrer"
          >
            {t('View on Etherscan')}
          </ExternalLink>
        </p>
      )}
      <EthTransactionDetails tx={tx} />
    </div>
  );
};

export const useEthereumTransactionToasts = () => {
  const ethTransactions = useEthTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissEthTransaction = useEthTransactionStore(
    (state) => state.dismiss
  );
  const fromEthTransaction = useCallback(
    (tx: EthStoredTxState): Toast => {
      let content: ToastContent = <TransactionContent {...tx} />;
      if (tx.status === EthTxStatus.Requested) {
        content = <EthTxRequestedToastContent tx={tx} />;
      }
      if (tx.status === EthTxStatus.Pending) {
        content = <EthTxPendingToastContent tx={tx} />;
      }
      if (
        tx.status === EthTxStatus.Confirmed ||
        tx.status === EthTxStatus.Complete
      ) {
        content = <EthTxConfirmedToastContent tx={tx} />;
      }
      if (tx.status === EthTxStatus.Error) {
        content = <EthTxErrorToastContent tx={tx} />;
      }

      return {
        id: `eth-${tx.id}`,
        intent: intentMap[tx.status],
        onClose: () => dismissEthTransaction(tx.id),
        loader: tx.status === EthTxStatus.Pending,
        content,
      };
    },
    [dismissEthTransaction]
  );

  return useMemo(() => {
    return [...compact(ethTransactions).map(fromEthTransaction)];
  }, [ethTransactions, fromEthTransaction]);
};
