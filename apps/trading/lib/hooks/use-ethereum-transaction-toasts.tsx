import type { ReactNode } from 'react';
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
  Complete: Intent.Warning,
  Confirmed: Intent.Success,
};

const isWithdrawTransaction = (tx: EthStoredTxState) =>
  tx.methodName === 'withdraw_asset';

const isDepositTransaction = (tx: EthStoredTxState) =>
  tx.methodName === 'deposit_asset';

const EthTransactionDetails = ({ tx }: { tx: EthStoredTxState }) => {
  const { data: assets } = useAssetsDataProvider();
  if (!assets) return null;

  const isWithdraw = isWithdrawTransaction(tx);
  const isDeposit = isDepositTransaction(tx);

  let assetInfo: ReactNode;
  if ((isWithdraw || isDeposit) && tx.args.length > 2 && tx.assetId) {
    const asset = assets.find((a) => a.id === tx.assetId);
    if (asset) {
      let label = '';
      if (isWithdraw) label = t('Withdraw');
      if (isDeposit) label = t('Deposit');
      assetInfo = (
        <div className="mt-[5px]">
          <span className="font-mono text-xs p-1 bg-gray-100 rounded">
            {label}{' '}
            {formatNumber(toBigNum(tx.args[1], asset.decimals), asset.decimals)}{' '}
            {asset.symbol}
          </span>
        </div>
      );
    }
  }

  return (
    <>
      {assetInfo}
      {tx.status === EthTxStatus.Pending && (
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
  return (
    <div>
      <h3 className="font-bold">{t('Awaiting confirmation')}</h3>
      <p>{t('Please wait for your transaction to be confirmed.')}</p>
      <EtherscanLink tx={tx} />
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

const EtherscanLink = ({ tx }: EthTxToastContentProps) => {
  const etherscanLink = useEtherscanLink();
  return tx.txHash ? (
    <p className="break-all">
      <ExternalLink
        href={etherscanLink(ETHERSCAN_TX.replace(':hash', tx.txHash))}
        rel="noreferrer"
      >
        {t('View on Etherscan')}
      </ExternalLink>
    </p>
  ) : null;
};

const EthTxConfirmedToastContent = ({ tx }: EthTxToastContentProps) => {
  return (
    <div>
      <h3 className="font-bold">{t('Transaction confirmed')}</h3>
      <p>{t('Your transaction has been confirmed.')}</p>
      <EtherscanLink tx={tx} />
      <EthTransactionDetails tx={tx} />
    </div>
  );
};

const EthTxCompletedToastContent = ({ tx }: EthTxToastContentProps) => {
  const isDeposit = isDepositTransaction(tx);
  return (
    <div>
      <h3 className="font-bold">
        {t('Processing')} {isDeposit && t('deposit')}
      </h3>
      <p>
        {t('Your transaction has been completed.')}{' '}
        {isDeposit && t('Waiting for deposit confirmation.')}
      </p>
      <EtherscanLink tx={tx} />
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
      if (tx.status === EthTxStatus.Complete) {
        content = <EthTxCompletedToastContent tx={tx} />;
      }
      if (tx.status === EthTxStatus.Confirmed) {
        content = <EthTxConfirmedToastContent tx={tx} />;
      }
      if (tx.status === EthTxStatus.Error) {
        content = <EthTxErrorToastContent tx={tx} />;
      }

      return {
        id: `eth-${tx.id}`,
        intent: intentMap[tx.status],
        onClose: () => dismissEthTransaction(tx.id),
        loader: [EthTxStatus.Pending, EthTxStatus.Complete].includes(tx.status),
        content,
      };
    },
    [dismissEthTransaction]
  );

  return useMemo(() => {
    return [...compact(ethTransactions).map(fromEthTransaction)];
  }, [ethTransactions, fromEthTransaction]);
};
