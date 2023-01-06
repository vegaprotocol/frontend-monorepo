import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import compact from 'lodash/compact';
import type {
  BatchMarketInstructionSubmissionBody,
  VegaStoredTxState,
  WithdrawalBusEventFieldsFragment,
  WithdrawSubmissionBody,
} from '@vegaprotocol/wallet';
import { isBatchMarketInstructionsTransaction } from '@vegaprotocol/wallet';
import {
  ClientErrors,
  useReconnectVegaWallet,
  WalletError,
} from '@vegaprotocol/wallet';
import {
  isOrderAmendmentTransaction,
  isOrderCancellationTransaction,
  isOrderSubmissionTransaction,
  isWithdrawTransaction,
  useVegaTransactionStore,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import type { Toast, ToastContent } from '@vegaprotocol/ui-toolkit';
import { Button, ExternalLink, Intent } from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  Size,
  t,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';
import { DApp, EXPLORER_TX, useLinks } from '@vegaprotocol/environment';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import { getRejectionReason } from '@vegaprotocol/orders';
import { useMarketList } from '@vegaprotocol/market-list';
import first from 'lodash/first';

const intentMap: { [s in VegaTxStatus]: Intent } = {
  Default: Intent.Primary,
  Requested: Intent.Warning,
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Complete: Intent.Success,
};

enum VegaTransactionType {
  WITHDRAW,
  SUBMIT_ORDER,
  CANCEL_ORDER,
  CANCEL_ALL,
  EDIT_ORDER,
  CLOSE_POSITION,
  BATCH_MARKET_INSTRUCTIONS,
}

const transactionLabels: { [t in VegaTransactionType]: string } = {
  [VegaTransactionType.WITHDRAW]: t('Withdraw'),
  [VegaTransactionType.SUBMIT_ORDER]: t('Order'),
  [VegaTransactionType.CANCEL_ORDER]: t('Cancel order'),
  [VegaTransactionType.CANCEL_ALL]: t('Cancel all orders'),
  [VegaTransactionType.EDIT_ORDER]: t('Edit order'),
  [VegaTransactionType.CLOSE_POSITION]: t('Close position'),
  [VegaTransactionType.BATCH_MARKET_INSTRUCTIONS]: t(
    'Batch market instruction'
  ),
};

const isClosePositionTransaction = (tx: VegaStoredTxState) => {
  if (isBatchMarketInstructionsTransaction(tx.body)) {
    const amendments =
      tx.body.batchMarketInstructions.amendments &&
      tx.body.batchMarketInstructions.amendments?.length > 0;

    const cancellation =
      tx.body.batchMarketInstructions.cancellations?.length === 1 &&
      tx.body.batchMarketInstructions.cancellations[0].orderId === '' &&
      tx.body.batchMarketInstructions.cancellations[0];

    const submission =
      cancellation &&
      tx.body.batchMarketInstructions.submissions?.length === 1 &&
      tx.body.batchMarketInstructions.submissions[0].marketId ===
        cancellation.marketId;

    return !amendments && cancellation && submission;
  }
  return false;
};

const determineVegaTransactionType = (
  tx: VegaStoredTxState
): VegaTransactionType | undefined => {
  if (isWithdrawTransaction(tx.body)) {
    return VegaTransactionType.WITHDRAW;
  }
  if (isOrderSubmissionTransaction(tx.body)) {
    return VegaTransactionType.SUBMIT_ORDER;
  }
  if (isOrderCancellationTransaction(tx.body)) {
    return tx.body.orderCancellation.marketId === undefined &&
      tx.body.orderCancellation.orderId === undefined
      ? VegaTransactionType.CANCEL_ALL
      : VegaTransactionType.CANCEL_ORDER;
  }
  if (isOrderAmendmentTransaction(tx.body)) {
    return VegaTransactionType.EDIT_ORDER;
  }
  if (isBatchMarketInstructionsTransaction(tx.body)) {
    return isClosePositionTransaction(tx)
      ? VegaTransactionType.CLOSE_POSITION
      : VegaTransactionType.BATCH_MARKET_INSTRUCTIONS;
  }
  return;
};

const Details = ({ children }: { children: ReactNode }) => (
  <div className="mt-[5px]" data-testid="vega-tx-details">
    <span className="font-mono text-xs p-1 bg-gray-100 rounded">
      {children}
    </span>
  </div>
);

export const VegaTransactionDetails = ({ tx }: { tx: VegaStoredTxState }) => {
  const { data: assets } = useAssetsDataProvider();
  const { data: markets } = useMarketList();
  if (!assets) return null;

  const transactionType = determineVegaTransactionType(tx);

  if (transactionType === VegaTransactionType.WITHDRAW) {
    const transactionDetails = tx.body as WithdrawSubmissionBody;
    const asset = assets?.find(
      (a) => a.id === transactionDetails.withdrawSubmission.asset
    );
    if (asset) {
      const num = formatNumber(
        toBigNum(transactionDetails.withdrawSubmission.amount, asset.decimals),
        asset.decimals
      );
      return (
        <Details>
          {transactionLabels[VegaTransactionType.WITHDRAW]} {num} {asset.symbol}
        </Details>
      );
    }
  }

  if (
    tx.order &&
    (transactionType === VegaTransactionType.SUBMIT_ORDER ||
      transactionType === VegaTransactionType.CANCEL_ORDER ||
      transactionType === VegaTransactionType.EDIT_ORDER)
  ) {
    const asset =
      tx.order.market.tradableInstrument.instrument.product.settlementAsset;
    const num = addDecimalsFormatNumber(
      tx.order.price,
      tx.order.market.decimalPlaces
    );
    return (
      <Details>
        {transactionLabels[transactionType]}{' '}
        <Size
          side={tx.order.side}
          value={tx.order.size}
          positionDecimalPlaces={tx.order.market.positionDecimalPlaces}
          forceTheme="light"
        />{' '}
        @ {num} {asset.symbol}
      </Details>
    );
  }

  if (tx.body && transactionType === VegaTransactionType.CLOSE_POSITION) {
    const transaction = tx.body as BatchMarketInstructionSubmissionBody;
    const marketId = first(
      transaction.batchMarketInstructions.cancellations
    )?.marketId;
    const market = marketId && markets?.find((m) => m.id === marketId);
    if (market) {
      return (
        <Details>
          {transactionLabels[transactionType]} {t('for')}{' '}
          {market.tradableInstrument.instrument.code}
        </Details>
      );
    }
  }

  return tx.body && transactionType ? (
    <Details>{transactionLabels[transactionType]}</Details>
  ) : null;
};

type VegaTxToastContentProps = { tx: VegaStoredTxState };

const VegaTxRequestedToastContent = ({ tx }: VegaTxToastContentProps) => (
  <div>
    <h3 className="font-bold">{t('Action required')}</h3>
    <p>
      {t(
        'Please go to your Vega wallet application and approve or reject the transaction.'
      )}
    </p>
    <VegaTransactionDetails tx={tx} />
  </div>
);

const VegaTxPendingToastContentProps = ({ tx }: VegaTxToastContentProps) => {
  const explorerLink = useLinks(DApp.Explorer);
  return (
    <div>
      <h3 className="font-bold">{t('Awaiting confirmation')}</h3>
      <p>{t('Please wait for your transaction to be confirmed')}</p>
      {tx.txHash && (
        <p className="break-all">
          <ExternalLink
            href={explorerLink(
              EXPLORER_TX.replace(':hash', prepend0x(tx.txHash))
            )}
            rel="noreferrer"
          >
            {t('View in block explorer')}
          </ExternalLink>
        </p>
      )}
      <VegaTransactionDetails tx={tx} />
    </div>
  );
};

const VegaTxCompleteToastsContent = ({ tx }: VegaTxToastContentProps) => {
  const { createEthWithdrawalApproval } = useEthWithdrawApprovalsStore(
    (state) => ({
      createEthWithdrawalApproval: state.create,
    })
  );
  const explorerLink = useLinks(DApp.Explorer);
  if (isWithdrawTransaction(tx.body)) {
    const completeWithdrawalButton = tx.withdrawal && (
      <div className="mt-[10px]">
        <Button
          size="xs"
          onClick={() => {
            createEthWithdrawalApproval(
              tx.withdrawal as WithdrawalBusEventFieldsFragment,
              tx.withdrawalApproval
            );
          }}
        >
          {t('Complete withdrawal')}
        </Button>
      </div>
    );
    return (
      <div>
        <h3 className="font-bold">{t('Funds unlocked')}</h3>
        <p>{t('Your funds have been unlocked for withdrawal')}</p>
        {tx.txHash && (
          <p className="break-all">
            <ExternalLink
              href={explorerLink(
                EXPLORER_TX.replace(':hash', prepend0x(tx.txHash))
              )}
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </ExternalLink>
          </p>
        )}
        <VegaTransactionDetails tx={tx} />
        {completeWithdrawalButton}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold">{t('Confirmed')}</h3>
      <p>{t('Your transaction has been confirmed ')}</p>
      {tx.txHash && (
        <p className="break-all">
          <ExternalLink
            href={explorerLink(
              EXPLORER_TX.replace(':hash', prepend0x(tx.txHash))
            )}
            rel="noreferrer"
          >
            {t('View in block explorer')}
          </ExternalLink>
        </p>
      )}
      <VegaTransactionDetails tx={tx} />
    </div>
  );
};

const VegaTxErrorToastContent = ({ tx }: VegaTxToastContentProps) => {
  let label = t('Error occurred');
  let errorMessage = `${tx.error?.message}  ${
    tx.error?.data ? `:  ${tx.error?.data}` : ''
  }`;
  const reconnectVegaWallet = useReconnectVegaWallet();

  const orderRejection = tx.order && getRejectionReason(tx.order);
  const walletNoConnectionCodes = [
    ClientErrors.NO_SERVICE.code,
    ClientErrors.NO_CLIENT.code,
  ];
  const walletError =
    tx.error instanceof WalletError &&
    walletNoConnectionCodes.includes(tx.error.code);
  if (orderRejection) {
    label = t('Order rejected');
    errorMessage = orderRejection;
  }
  if (walletError) {
    label = t('Wallet disconnected');
    errorMessage = t('The connection to your Vega Wallet has been lost.');
  }

  return (
    <div>
      <h3 className="font-bold">{label}</h3>
      <p>{errorMessage}</p>
      {walletError && (
        <Button size="xs" onClick={reconnectVegaWallet}>
          {t('Connect vega wallet')}
        </Button>
      )}
      <VegaTransactionDetails tx={tx} />
    </div>
  );
};

export const useVegaTransactionToasts = () => {
  const vegaTransactions = useVegaTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissVegaTransaction = useVegaTransactionStore(
    (state) => state.dismiss
  );

  useEffect(() => console.log(vegaTransactions), [vegaTransactions]);

  const fromVegaTransaction = useCallback(
    (tx: VegaStoredTxState): Toast => {
      let content: ToastContent;
      if (tx.status === VegaTxStatus.Requested) {
        content = <VegaTxRequestedToastContent tx={tx} />;
      }
      if (tx.status === VegaTxStatus.Pending) {
        content = <VegaTxPendingToastContentProps tx={tx} />;
      }
      if (tx.status === VegaTxStatus.Complete) {
        content = <VegaTxCompleteToastsContent tx={tx} />;
      }
      if (tx.status === VegaTxStatus.Error) {
        content = <VegaTxErrorToastContent tx={tx} />;
      }
      return {
        id: `vega-${tx.id}`,
        intent: intentMap[tx.status],
        onClose: () => dismissVegaTransaction(tx.id),
        loader: tx.status === VegaTxStatus.Pending,
        content,
      };
    },
    [dismissVegaTransaction]
  );

  const toasts = useMemo(() => {
    return [
      ...compact(vegaTransactions)
        .filter((tx) => determineVegaTransactionType(tx) !== undefined)
        .map(fromVegaTransaction),
    ];
  }, [fromVegaTransaction, vegaTransactions]);

  return toasts;
};
