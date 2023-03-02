import type { ReactNode } from 'react';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { ETHERSCAN_TX, useEtherscanLink } from '@vegaprotocol/environment';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { Toast, ToastContent } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { Panel } from '@vegaprotocol/ui-toolkit';
import { CLOSE_AFTER } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { ExternalLink, Intent, ProgressBar } from '@vegaprotocol/ui-toolkit';
import { useCallback } from 'react';
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
        <strong>
          {label}{' '}
          {formatNumber(toBigNum(tx.args[1], asset.decimals), asset.decimals)}{' '}
          {asset.symbol}
        </strong>
      );
    }
  }

  if (assetInfo || tx.requiresConfirmation) {
    return (
      <Panel>
        {assetInfo}
        {tx.status === EthTxStatus.Pending && (
          <>
            <p className="mt-[2px]">
              {t('Awaiting confirmations')}{' '}
              {`(${tx.confirmations}/${tx.requiredConfirmations})`}
            </p>
            <ProgressBar
              value={(tx.confirmations / tx.requiredConfirmations) * 100}
            />
          </>
        )}
      </Panel>
    );
  }

  return null;
};

type EthTxToastContentProps = {
  tx: EthStoredTxState;
};

const EthTxRequestedToastContent = ({ tx }: EthTxToastContentProps) => {
  return (
    <>
      <ToastHeading>{t('Action required')}</ToastHeading>
      <p>
        {t(
          'Please go to your wallet application and approve or reject the transaction.'
        )}
      </p>
      <EthTransactionDetails tx={tx} />
    </>
  );
};

const EthTxPendingToastContent = ({ tx }: EthTxToastContentProps) => {
  return (
    <>
      <ToastHeading>{t('Awaiting confirmation')}</ToastHeading>
      <p>{t('Please wait for your transaction to be confirmed.')}</p>
      <EtherscanLink tx={tx} />
      <EthTransactionDetails tx={tx} />
    </>
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
    <>
      <ToastHeading>{t('Error occurred')}</ToastHeading>
      <p className="first-letter:uppercase">{errorMessage}</p>
      <EthTransactionDetails tx={tx} />
    </>
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
    <>
      <ToastHeading>{t('Transaction confirmed')}</ToastHeading>
      <p>{t('Your transaction has been confirmed.')}</p>
      <EtherscanLink tx={tx} />
      <EthTransactionDetails tx={tx} />
    </>
  );
};

const EthTxCompletedToastContent = ({ tx }: EthTxToastContentProps) => {
  const isDeposit = isDepositTransaction(tx);
  return (
    <>
      <ToastHeading>
        {t('Processing')} {isDeposit && t('deposit')}
      </ToastHeading>
      <p>
        {t('Your transaction has been completed.')}{' '}
        {isDeposit && t('Waiting for deposit confirmation.')}
      </p>
      <EtherscanLink tx={tx} />
      <EthTransactionDetails tx={tx} />
    </>
  );
};

const isFinal = (tx: EthStoredTxState) =>
  [EthTxStatus.Confirmed, EthTxStatus.Error].includes(tx.status);

export const useEthereumTransactionToasts = () => {
  const [setToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.remove,
  ]);

  const [dismissTx, deleteTx] = useEthTransactionStore((state) => [
    state.dismiss,
    state.delete,
  ]);

  const onClose = useCallback(
    (tx: EthStoredTxState) => () => {
      const safeToDelete = isFinal(tx);
      if (safeToDelete) {
        deleteTx(tx.id);
      } else {
        dismissTx(tx.id);
      }
      removeToast(`eth-${tx.id}`);
    },
    [deleteTx, dismissTx, removeToast]
  );

  const fromEthTransaction = useCallback(
    (tx: EthStoredTxState): Toast => {
      let content: ToastContent = <TransactionContent {...tx} />;
      const closeAfter = isFinal(tx) ? CLOSE_AFTER : undefined;
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
        onClose: onClose(tx),
        loader: [EthTxStatus.Pending, EthTxStatus.Complete].includes(tx.status),
        content,
        closeAfter,
      };
    },
    [onClose]
  );

  useEthTransactionStore.subscribe(
    (state) => compact(state.transactions.filter((tx) => tx?.dialogOpen)),
    (txs) => {
      txs.forEach((tx) => {
        setToast(fromEthTransaction(tx));
      });
    }
  );
};
