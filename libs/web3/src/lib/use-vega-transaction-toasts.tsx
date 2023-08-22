import { useCallback } from 'react';
import first from 'lodash/first';
import compact from 'lodash/compact';
import type {
  BatchMarketInstructionSubmissionBody,
  OrderAmendment,
  OrderTxUpdateFieldsFragment,
  OrderSubmission,
  VegaStoredTxState,
  WithdrawalBusEventFieldsFragment,
  StopOrdersSubmission,
} from '@vegaprotocol/wallet';
import {
  isTransferTransaction,
  isBatchMarketInstructionsTransaction,
  ClientErrors,
  useReconnectVegaWallet,
  WalletError,
  isOrderAmendmentTransaction,
  isOrderCancellationTransaction,
  isOrderSubmissionTransaction,
  isWithdrawTransaction,
  useVegaTransactionStore,
  VegaTxStatus,
  isStopOrdersSubmissionTransaction,
  isStopOrdersCancellationTransaction,
} from '@vegaprotocol/wallet';
import type { Toast, ToastContent } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { Panel } from '@vegaprotocol/ui-toolkit';
import { CLOSE_AFTER } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { Button, ExternalLink, Intent } from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
  truncateByChars,
  formatTrigger,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { useEthWithdrawApprovalsStore } from './use-ethereum-withdraw-approvals-store';
import { DApp, EXPLORER_TX, useLinks } from '@vegaprotocol/environment';
import {
  getOrderToastIntent,
  getOrderToastTitle,
  getRejectionReason,
  useOrderByIdQuery,
  useStopOrderByIdQuery,
} from '@vegaprotocol/orders';
import { getAsset, useMarketsMapProvider } from '@vegaprotocol/markets';
import type { Side } from '@vegaprotocol/types';
import { OrderStatusMapping } from '@vegaprotocol/types';
import { Size } from '@vegaprotocol/datagrid';
import { useWithdrawalApprovalDialog } from './withdrawal-approval-dialog';
import * as Schema from '@vegaprotocol/types';

const intentMap: { [s in VegaTxStatus]: Intent } = {
  Default: Intent.Primary,
  Requested: Intent.Warning,
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Complete: Intent.Success,
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

const isTransactionTypeSupported = (tx: VegaStoredTxState) => {
  const withdraw = isWithdrawTransaction(tx.body);
  const submitOrder = isOrderSubmissionTransaction(tx.body);
  const cancelOrder = isOrderCancellationTransaction(tx.body);
  const submitStopOrder = isStopOrdersSubmissionTransaction(tx.body);
  const cancelStopOrder = isStopOrdersCancellationTransaction(tx.body);
  const editOrder = isOrderAmendmentTransaction(tx.body);
  const batchMarketInstructions = isBatchMarketInstructionsTransaction(tx.body);
  const transfer = isTransferTransaction(tx.body);
  return (
    withdraw ||
    submitOrder ||
    cancelOrder ||
    submitStopOrder ||
    cancelStopOrder ||
    editOrder ||
    batchMarketInstructions ||
    transfer
  );
};

type SizeAtPriceProps = {
  side: Side;
  size: string;
  price: string | undefined;
  meta: { positionDecimalPlaces: number; decimalPlaces: number; asset: string };
};
const SizeAtPrice = ({ side, size, price, meta }: SizeAtPriceProps) => {
  return (
    <>
      <Size
        side={side}
        value={size}
        positionDecimalPlaces={meta.positionDecimalPlaces}
        forceTheme="light"
      />{' '}
      {price && price !== '0' && meta.decimalPlaces
        ? `@ ${addDecimalsFormatNumber(price, meta.decimalPlaces)} ${
            meta.asset
          }`
        : `@ ~ ${meta.asset}`}
    </>
  );
};

const SubmitOrderDetails = ({
  data,
  order,
}: {
  data: OrderSubmission;
  order?: OrderTxUpdateFieldsFragment;
}) => {
  const { data: markets } = useMarketsMapProvider();
  const market = markets?.[order?.marketId || ''];
  if (!market) return null;

  const price = order ? order.price : data.price;
  const size = order ? order.size : data.size;
  const side = order ? order.side : data.side;

  return (
    <Panel>
      <h4>
        {order
          ? t(
              `Submit order - ${OrderStatusMapping[order.status].toLowerCase()}`
            )
          : t('Submit order')}
      </h4>
      <p>{market?.tradableInstrument.instrument.code}</p>
      <p>
        <SizeAtPrice
          meta={{
            positionDecimalPlaces: market.positionDecimalPlaces,
            decimalPlaces: market.decimalPlaces,
            asset: getAsset(market).symbol,
          }}
          side={side}
          size={size}
          price={price}
        />
      </p>
    </Panel>
  );
};

const SubmitStopOrderDetails = ({ data }: { data: StopOrdersSubmission }) => {
  const { data: markets } = useMarketsMapProvider();
  const stopOrderSetup = data.risesAbove || data.fallsBelow;
  if (!stopOrderSetup) return null;
  const market = markets?.[stopOrderSetup?.orderSubmission.marketId];
  if (!market || !stopOrderSetup) return null;

  const { price, size, side } = stopOrderSetup.orderSubmission;
  let trigger: Schema.StopOrderTrigger | null = null;
  if (stopOrderSetup.price) {
    trigger = { price: stopOrderSetup.price, __typename: 'StopOrderPrice' };
  } else if (stopOrderSetup.trailingPercentOffset) {
    trigger = {
      trailingPercentOffset: stopOrderSetup.trailingPercentOffset,
      __typename: 'StopOrderTrailingPercentOffset',
    };
  }
  const triggerDirection = data.risesAbove
    ? Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE
    : Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW;
  return (
    <Panel>
      <h4>{t('Submit stop order')}</h4>
      <p>{market?.tradableInstrument.instrument.code}</p>
      <p>
        <SizeAtPrice
          meta={{
            positionDecimalPlaces: market.positionDecimalPlaces,
            decimalPlaces: market.decimalPlaces,
            asset: getAsset(market).symbol,
          }}
          side={side}
          size={size}
          price={price}
        />
        <br />
        {trigger &&
          formatTrigger(
            {
              triggerDirection,
              trigger,
            },
            market.decimalPlaces,
            ''
          )}
      </p>
    </Panel>
  );
};

const EditOrderDetails = ({
  data,
  order,
}: {
  data: OrderAmendment;
  order?: OrderTxUpdateFieldsFragment;
}) => {
  const { data: orderById } = useOrderByIdQuery({
    variables: { orderId: data.orderId },
    fetchPolicy: 'no-cache',
  });
  const { data: markets } = useMarketsMapProvider();

  const originalOrder = order || orderById?.orderByID;
  const marketId = order?.marketId || orderById?.orderByID.market.id;
  const market = markets?.[marketId || ''];
  if (!originalOrder || !market) return null;

  const original = (
    <SizeAtPrice
      side={originalOrder.side}
      size={originalOrder.size}
      price={originalOrder.price}
      meta={{
        positionDecimalPlaces: market.positionDecimalPlaces,
        decimalPlaces: market.decimalPlaces,
        asset: getAsset(market).symbol,
      }}
    />
  );

  const edited = (
    <SizeAtPrice
      side={originalOrder.side}
      size={String(Number(originalOrder.size) + (data.sizeDelta || 0))}
      price={data.price}
      meta={{
        positionDecimalPlaces: market.positionDecimalPlaces,
        decimalPlaces: market.decimalPlaces,
        asset: getAsset(market).symbol,
      }}
    />
  );

  return (
    <Panel title={data.orderId}>
      <h4>
        {order
          ? t(`Edit order - ${OrderStatusMapping[order.status].toLowerCase()}`)
          : t('Edit order')}
      </h4>
      <p>{market?.tradableInstrument.instrument.code}</p>
      <p>
        <s>{original}</s>
      </p>
      <p>{edited}</p>
    </Panel>
  );
};

const CancelOrderDetails = ({
  orderId,
  order,
}: {
  orderId: string;
  order?: OrderTxUpdateFieldsFragment;
}) => {
  const { data: orderById } = useOrderByIdQuery({
    variables: { orderId },
  });
  const { data: markets } = useMarketsMapProvider();

  const originalOrder = orderById?.orderByID;
  if (!originalOrder) return null;
  const market = markets?.[originalOrder.market.id];
  if (!market) return null;

  const original = (
    <SizeAtPrice
      side={originalOrder.side}
      size={originalOrder.size}
      price={originalOrder.price}
      meta={{
        positionDecimalPlaces: market.positionDecimalPlaces,
        decimalPlaces: market.decimalPlaces,
        asset: getAsset(market).symbol,
      }}
    />
  );
  return (
    <Panel title={orderId}>
      <h4>
        {order
          ? t(
              `Cancel order - ${OrderStatusMapping[order.status].toLowerCase()}`
            )
          : t('Cancel order')}
      </h4>
      <p>{market?.tradableInstrument.instrument.code}</p>
      <p>
        <s>{original}</s>
      </p>
    </Panel>
  );
};

const CancelStopOrderDetails = ({ stopOrderId }: { stopOrderId: string }) => {
  const { data: orderById } = useStopOrderByIdQuery({
    variables: { stopOrderId },
  });
  const { data: markets } = useMarketsMapProvider();

  const originalOrder = orderById?.stopOrder;
  if (!originalOrder) return null;
  const market = markets?.[originalOrder.marketId];
  if (!market) return null;

  const original = (
    <>
      <SizeAtPrice
        side={originalOrder.submission.side}
        size={originalOrder.submission.size}
        price={originalOrder.submission.price}
        meta={{
          positionDecimalPlaces: market.positionDecimalPlaces,
          decimalPlaces: market.decimalPlaces,
          asset: getAsset(market).symbol,
        }}
      />
      <br />
      {formatTrigger(originalOrder, market.decimalPlaces, '')}
    </>
  );
  return (
    <Panel title={stopOrderId}>
      <h4>{t('Cancel stop order')}</h4>
      <p>{market?.tradableInstrument.instrument.code}</p>
      <p>
        <s>{original}</s>
      </p>
    </Panel>
  );
};

export const VegaTransactionDetails = ({ tx }: { tx: VegaStoredTxState }) => {
  const { data: assets } = useAssetsMapProvider();
  const { data: markets } = useMarketsMapProvider();

  if (isWithdrawTransaction(tx.body)) {
    const transactionDetails = tx.body;
    const asset = assets?.[transactionDetails.withdrawSubmission.asset];
    if (asset) {
      const num = formatNumber(
        toBigNum(transactionDetails.withdrawSubmission.amount, asset.decimals),
        asset.decimals
      );
      return (
        <Panel>
          <strong>
            {t('Withdraw')} {num} {asset.symbol}
          </strong>
        </Panel>
      );
    }
  }

  if (isOrderSubmissionTransaction(tx.body)) {
    return (
      <SubmitOrderDetails data={tx.body.orderSubmission} order={tx.order} />
    );
  }

  if (isStopOrdersSubmissionTransaction(tx.body)) {
    return <SubmitStopOrderDetails data={tx.body.stopOrdersSubmission} />;
  }

  if (isOrderCancellationTransaction(tx.body)) {
    // CANCEL
    if (
      tx.body.orderCancellation.orderId &&
      tx.body.orderCancellation.marketId
    ) {
      return (
        <CancelOrderDetails
          orderId={String(tx.body.orderCancellation.orderId)}
          order={tx.order}
        />
      );
    }

    // CANCEL ALL (from Trading)
    if (tx.body.orderCancellation.marketId) {
      const marketName =
        markets?.[tx.body.orderCancellation.marketId]?.tradableInstrument
          .instrument.code;
      if (marketName) {
        return (
          <Panel>
            {t('Cancel all orders for')} <strong>{marketName}</strong>
          </Panel>
        );
      }
    }
    // CANCEL ALL (from Portfolio)
    return <Panel>{t('Cancel all orders')}</Panel>;
  }

  if (isStopOrdersCancellationTransaction(tx.body)) {
    // CANCEL
    if (
      tx.body.stopOrdersCancellation.stopOrderId &&
      tx.body.stopOrdersCancellation.marketId
    ) {
      return (
        <CancelStopOrderDetails
          stopOrderId={String(tx.body.stopOrdersCancellation.stopOrderId)}
        />
      );
    }

    // CANCEL ALL for market
    if (tx.body.stopOrdersCancellation.marketId) {
      const marketName =
        markets?.[tx.body.stopOrdersCancellation.marketId]?.tradableInstrument
          .instrument.code;
      if (marketName) {
        return (
          <Panel>
            {t('Cancel all stop orders for')} <strong>{marketName}</strong>
          </Panel>
        );
      }
    }

    // CANCEL ALL
    return <Panel>{t('Cancel all stop orders')}</Panel>;
  }

  if (isOrderAmendmentTransaction(tx.body)) {
    return (
      <EditOrderDetails
        data={tx.body.orderAmendment}
        order={tx.order}
      ></EditOrderDetails>
    );
  }

  if (isClosePositionTransaction(tx)) {
    const transaction = tx.body as BatchMarketInstructionSubmissionBody;
    const marketId = first(
      transaction.batchMarketInstructions.cancellations
    )?.marketId;
    const market = markets?.[marketId || ''];
    if (market) {
      return (
        <Panel>
          {t('Close position for')}{' '}
          <strong>{market.tradableInstrument.instrument.code}</strong>
        </Panel>
      );
    }
  }

  if (isBatchMarketInstructionsTransaction(tx.body)) {
    return <Panel>{t('Batch market instruction')}</Panel>;
  }

  if (isTransferTransaction(tx.body)) {
    const { amount, to, asset } = tx.body.transfer;
    const transferAsset = assets?.[asset];
    // only render if we have an asset to avoid unformatted amounts showing
    if (transferAsset) {
      const value = addDecimalsFormatNumber(amount, transferAsset.decimals);
      return (
        <Panel>
          <h4>{t('Transfer')}</h4>
          <p>
            {t('To')} {truncateByChars(to)}
          </p>
          <p>
            {value} {transferAsset.symbol}
          </p>
        </Panel>
      );
    }
  }

  return null;
};

type VegaTxToastContentProps = { tx: VegaStoredTxState };

const VegaTxRequestedToastContent = ({ tx }: VegaTxToastContentProps) => (
  <>
    <ToastHeading>{t('Action required')}</ToastHeading>
    <p>
      {t(
        'Please go to your Vega wallet application and approve or reject the transaction.'
      )}
    </p>
    <VegaTransactionDetails tx={tx} />
  </>
);

const VegaTxPendingToastContentProps = ({ tx }: VegaTxToastContentProps) => {
  const explorerLink = useLinks(DApp.Explorer);
  return (
    <>
      <ToastHeading>{t('Awaiting confirmation')}</ToastHeading>
      <p>{t('Please wait for your transaction to be confirmed')}</p>
      {tx.txHash && (
        <p className="break-all">
          <ExternalLink
            href={explorerLink(EXPLORER_TX.replace(':hash', tx.txHash))}
            rel="noreferrer"
          >
            {t('View in block explorer')}
          </ExternalLink>
        </p>
      )}
      <VegaTransactionDetails tx={tx} />
    </>
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
      <p className="mt-1">
        <Button
          data-testid="toast-complete-withdrawal"
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
      </p>
    );

    const dialogTrigger = (
      // It has to stay as <a> due to the word breaking issue
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a
        href="#"
        className="inline underline underline-offset-4 cursor-pointer text-inherit break-words"
        data-testid="toast-withdrawal-details"
        onClick={(e) => {
          e.preventDefault();
          if (tx.withdrawal?.id) {
            useWithdrawalApprovalDialog.getState().open(tx.withdrawal?.id);
          }
        }}
      >
        {t('save your withdrawal details')}
      </a>
    );

    return (
      <>
        <ToastHeading>{t('Funds unlocked')}</ToastHeading>
        <p>{t('Your funds have been unlocked for withdrawal.')}</p>
        {tx.txHash && (
          <ExternalLink
            className="block mb-[5px] break-all"
            href={explorerLink(EXPLORER_TX.replace(':hash', tx.txHash))}
            rel="noreferrer"
          >
            {t('View in block explorer')}
          </ExternalLink>
        )}
        {/* TODO: Delay message - This withdrawal is subject to a delay. Come back in 5 days to complete the withdrawal. */}
        <p className="break-words">
          {t('You can')} {dialogTrigger} {t('for extra security.')}
        </p>
        <VegaTransactionDetails tx={tx} />
        {completeWithdrawalButton}
      </>
    );
  }

  if (tx.order && tx.order.rejectionReason) {
    const rejectionReason = getRejectionReason(tx.order);
    return (
      <>
        <ToastHeading>{getOrderToastTitle(tx.order.status)}</ToastHeading>
        {rejectionReason ? (
          <p>
            {t('Your order has been %s because: %s', [
              tx.order.status === Schema.OrderStatus.STATUS_STOPPED
                ? 'stopped'
                : 'rejected',
              rejectionReason,
            ])}
          </p>
        ) : (
          <p>
            {t('Your order has been %s.', [
              tx.order.status === Schema.OrderStatus.STATUS_STOPPED
                ? 'stopped'
                : 'rejected',
            ])}
          </p>
        )}
        {tx.txHash && (
          <p className="break-all">
            <ExternalLink
              href={explorerLink(EXPLORER_TX.replace(':hash', tx.txHash))}
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </ExternalLink>
          </p>
        )}
        <VegaTransactionDetails tx={tx} />
      </>
    );
  }

  if (isOrderSubmissionTransaction(tx.body) && tx.order?.rejectionReason) {
    return (
      <div>
        <h3 className="font-bold">{getOrderToastTitle(tx.order.status)}</h3>
        <p>{t('Your order was rejected.')}</p>
        {tx.txHash && (
          <p className="break-all">
            <ExternalLink
              href={explorerLink(EXPLORER_TX.replace(':hash', tx.txHash))}
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </ExternalLink>
          </p>
        )}
        <VegaTransactionDetails tx={tx} />
      </div>
    );
  }

  if (isTransferTransaction(tx.body)) {
    return (
      <div>
        <h3 className="font-bold">{t('Transfer complete')}</h3>
        <p>{t('Your transaction has been confirmed ')}</p>
        {tx.txHash && (
          <p className="break-all">
            <ExternalLink
              href={explorerLink(EXPLORER_TX.replace(':hash', tx.txHash))}
              rel="noreferrer"
            >
              {t('View in block explorer')}
            </ExternalLink>
          </p>
        )}
        <VegaTransactionDetails tx={tx} />
      </div>
    );
  }

  return (
    <>
      <ToastHeading>
        {tx.order?.status
          ? getOrderToastTitle(tx.order.status)
          : t('Confirmed')}
      </ToastHeading>
      <p>{t('Your transaction has been confirmed ')}</p>
      {tx.txHash && (
        <p className="break-all">
          <ExternalLink
            href={explorerLink(EXPLORER_TX.replace(':hash', tx.txHash))}
            rel="noreferrer"
          >
            {t('View in block explorer')}
          </ExternalLink>
        </p>
      )}
      <VegaTransactionDetails tx={tx} />
    </>
  );
};

const VegaTxErrorToastContent = ({ tx }: VegaTxToastContentProps) => {
  let label = t('Error occurred');
  let errorMessage = `${tx.error?.message}  ${
    tx.error instanceof WalletError && tx.error?.data
      ? `:  ${tx.error?.data}`
      : ''
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
    label = getOrderToastTitle(tx.order?.status) || t('Order rejected');
    errorMessage = t('Your order has been rejected because: %s', [
      orderRejection || tx.order?.rejectionReason || ' ',
    ]);
  }
  if (walletError) {
    label = t('Wallet disconnected');
    errorMessage = t('The connection to your Vega Wallet has been lost.');
  }

  return (
    <>
      <ToastHeading>{label}</ToastHeading>
      <p className="first-letter:uppercase">{errorMessage}</p>
      {walletError && (
        <Button size="xs" onClick={reconnectVegaWallet}>
          {t('Connect vega wallet')}
        </Button>
      )}
      <VegaTransactionDetails tx={tx} />
    </>
  );
};

const isFinal = (tx: VegaStoredTxState) =>
  [VegaTxStatus.Error, VegaTxStatus.Complete].includes(tx.status);

export const useVegaTransactionToasts = () => {
  const [setToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.remove,
  ]);

  const [dismissTx, deleteTx] = useVegaTransactionStore((state) => [
    state.dismiss,
    state.delete,
  ]);

  const onClose = useCallback(
    (tx: VegaStoredTxState) => () => {
      const safeToDelete = isFinal(tx);
      if (safeToDelete) {
        deleteTx(tx.id);
      } else {
        dismissTx(tx.id);
      }
      removeToast(`vega-${tx.id}`);
    },
    [deleteTx, dismissTx, removeToast]
  );

  const fromVegaTransaction = (tx: VegaStoredTxState): Toast => {
    const { intent, content } = getVegaTransactionContentIntent(tx);
    const closeAfter =
      isFinal(tx) && !isWithdrawTransaction(tx.body) ? CLOSE_AFTER : undefined;

    // marks "Funds unlocked" toast so it can be found in eth toasts
    const meta =
      isFinal(tx) && isWithdrawTransaction(tx.body)
        ? { withdrawalId: tx.withdrawal?.id }
        : undefined;

    return {
      id: `vega-${tx.id}`,
      intent,
      onClose: onClose(tx),
      loader: tx.status === VegaTxStatus.Pending,
      content,
      closeAfter,
      meta,
    };
  };

  useVegaTransactionStore.subscribe(
    (state) =>
      compact(
        state.transactions.filter(
          (tx) => tx?.dialogOpen && isTransactionTypeSupported(tx)
        )
      ),
    (txs) => {
      txs.forEach((tx) => setToast(fromVegaTransaction(tx)));
    }
  );
};

export const getVegaTransactionContentIntent = (tx: VegaStoredTxState) => {
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

  // Transaction can be successful but the order can be rejected by the network
  const intentForRejectedOrder =
    tx.order &&
    !isOrderAmendmentTransaction(tx.body) &&
    getOrderToastIntent(tx.order.status);

  // Although the transaction is completed on the vega network the whole
  // withdrawal process is not - funds are only released at this point
  const intentForCompletedWithdrawal =
    tx.status === VegaTxStatus.Complete &&
    isWithdrawTransaction(tx.body) &&
    Intent.Warning;

  const intent =
    intentForRejectedOrder ||
    intentForCompletedWithdrawal ||
    intentMap[tx.status];

  return { intent, content };
};
