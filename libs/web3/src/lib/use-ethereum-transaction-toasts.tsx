import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { EtherscanLink } from '@vegaprotocol/environment';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import type { Toast, ToastContent } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { Panel } from '@vegaprotocol/ui-toolkit';
import { CLOSE_AFTER } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { Intent, ProgressBar } from '@vegaprotocol/ui-toolkit';
import { useCallback } from 'react';
import compact from 'lodash/compact';
import type { EthStoredTxState } from './use-ethereum-transaction-store';
import { EthTxStatus } from './use-ethereum-transaction';
import { isEthereumError } from './ethereum-error';
import { TransactionContent } from './ethereum-transaction-dialog';
import { useEthTransactionStore } from './use-ethereum-transaction-store';
import { useT } from './use-t';

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
  const t = useT();
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
              {t(
                'Awaiting confirmations {{confirmations}}/{{requiredConfirmations}}',
                {
                  confirmations: tx.confirmations,
                  requiredConfirmations: tx.requiredConfirmations,
                }
              )}
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
  const t = useT();
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
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Awaiting confirmation')}</ToastHeading>
      <p>{t('Please wait for your transaction to be confirmed.')}</p>
      {tx.txHash && (
        <EtherscanLink tx={tx.txHash}>{t('View on Etherscan')}</EtherscanLink>
      )}
      <EthTransactionDetails tx={tx} />
    </>
  );
};

const EthTxErrorToastContent = ({ tx }: EthTxToastContentProps) => {
  const t = useT();
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

const EthTxConfirmedToastContent = ({ tx }: EthTxToastContentProps) => {
  const t = useT();
  return (
    <>
      <ToastHeading>{t('Transaction confirmed')}</ToastHeading>
      <p>{t('Your transaction has been confirmed.')}</p>
      {tx.txHash && (
        <EtherscanLink tx={tx.txHash}>{t('View on Etherscan')}</EtherscanLink>
      )}
      <EthTransactionDetails tx={tx} />
    </>
  );
};

const EthTxCompletedToastContent = ({ tx }: EthTxToastContentProps) => {
  const t = useT();
  const isDeposit = isDepositTransaction(tx);
  return (
    <>
      <ToastHeading>
        {isDeposit ? t('Processing deposit') : t('Processing')}
      </ToastHeading>
      <p>
        {t('Your transaction has been completed.')}{' '}
        {isDeposit && t('Waiting for deposit confirmation.')}
      </p>
      {tx.txHash && (
        <EtherscanLink tx={tx.txHash}>{t('View on Etherscan')}</EtherscanLink>
      )}
      <EthTransactionDetails tx={tx} />
    </>
  );
};

const isFinal = (tx: EthStoredTxState) =>
  [EthTxStatus.Confirmed, EthTxStatus.Error].includes(tx.status);

export const useEthereumTransactionToasts = () => {
  const [setToast, removeToast, closeToastBy] = useToasts((store) => [
    store.setToast,
    store.remove,
    store.closeBy,
  ]);

  const dismissTx = useEthTransactionStore((state) => state.dismiss);
  const updateTx = useEthTransactionStore((state) => state.update);

  const onClose = useCallback(
    (tx: EthStoredTxState) => () => {
      dismissTx(tx.id);
      removeToast(`eth-${tx.id}`);
      updateTx(tx.id, { notify: false });
      // closes related "Funds released" toast after successful withdrawal
      if (
        isWithdrawTransaction(tx) &&
        tx.status === EthTxStatus.Confirmed &&
        tx.withdrawal
      ) {
        closeToastBy({ withdrawalId: tx.withdrawal.id });
      }
    },
    [closeToastBy, dismissTx, removeToast, updateTx]
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
        hidden: !tx.notify,
      };
    },
    [onClose]
  );

  // Only register a subscription once
  useEffect(() => {
    const unsubscribe = useEthTransactionStore.subscribe(
      (state) => compact(state.transactions.filter((tx) => tx?.dialogOpen)),
      (txs) => {
        txs.forEach((tx) => {
          setToast(fromEthTransaction(tx));
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [fromEthTransaction, setToast]);
};
