import { useCallback } from 'react';
import first from 'lodash/first';
import compact from 'lodash/compact';
import type {
  BatchMarketInstructionSubmissionBody,
  OrderAmendment,
  OrderTxUpdateFieldsFragment,
  OrderCancellationBody,
  OrderSubmission,
  VegaStoredTxState,
  WithdrawalBusEventFieldsFragment,
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
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { useEthWithdrawApprovalsStore } from './use-ethereum-withdraw-approvals-store';
import { DApp, EXPLORER_TX, useLinks } from '@vegaprotocol/environment';
import {
  getOrderToastIntent,
  getOrderToastTitle,
  getRejectionReason,
  useOrderByIdQuery,
} from '@vegaprotocol/orders';
import { useMarketList } from '@vegaprotocol/markets';
import type { Side } from '@vegaprotocol/types';
import { OrderStatusMapping } from '@vegaprotocol/types';
import { Size } from '@vegaprotocol/datagrid';
import { useWithdrawalApprovalDialog } from './withdrawal-approval-dialog';

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
  const editOrder = isOrderAmendmentTransaction(tx.body);
  const batchMarketInstructions = isBatchMarketInstructionsTransaction(tx.body);
  const transfer = isTransferTransaction(tx.body);
  return (
    withdraw ||
    submitOrder ||
    cancelOrder ||
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
  const { data: markets } = useMarketList();
  const market = markets?.find((m) => m.id === order?.marketId);
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
            asset:
              market.tradableInstrument.instrument.product.settlementAsset
                .symbol,
          }}
          side={side}
          size={size}
          price={price}
        />
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
  const { data: markets } = useMarketList();

  const originalOrder = order || orderById?.orderByID;
  const marketId = order?.marketId || orderById?.orderByID.market.id;
  if (!originalOrder) return null;
  const market = markets?.find((m) => m.id === marketId);
  if (!market) return null;

  const original = (
    <SizeAtPrice
      side={originalOrder.side}
      size={originalOrder.size}
      price={originalOrder.price}
      meta={{
        positionDecimalPlaces: market.positionDecimalPlaces,
        decimalPlaces: market.decimalPlaces,
        asset:
          market.tradableInstrument.instrument.product.settlementAsset.symbol,
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
        asset:
          market.tradableInstrument.instrument.product.settlementAsset.symbol,
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
  const { data: markets } = useMarketList();

  const originalOrder = orderById?.orderByID;
  if (!originalOrder) return null;
  const market = markets?.find((m) => m.id === originalOrder.market.id);
  if (!market) return null;

  const original = (
    <SizeAtPrice
      side={originalOrder.side}
      size={originalOrder.size}
      price={originalOrder.price}
      meta={{
        positionDecimalPlaces: market.positionDecimalPlaces,
        decimalPlaces: market.decimalPlaces,
        asset:
          market.tradableInstrument.instrument.product.settlementAsset.symbol,
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

export const VegaTransactionDetails = ({ tx }: { tx: VegaStoredTxState }) => {
  const { data: assets } = useAssetsDataProvider();
  const { data: markets } = useMarketList();

  if (isWithdrawTransaction(tx.body)) {
    const transactionDetails = tx.body;
    const asset = assets?.find(
      (a) => a.id === transactionDetails.withdrawSubmission.asset
    );
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

  if (isOrderCancellationTransaction(tx.body)) {
    // CANCEL ALL (from Portfolio)
    if (
      tx.body.orderCancellation.marketId === undefined &&
      tx.body.orderCancellation.orderId === undefined
    ) {
      return <Panel>{t('Cancel all orders')}</Panel>;
    }

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
      const marketName = markets?.find(
        (m) =>
          m.id === (tx.body as OrderCancellationBody).orderCancellation.marketId
      )?.tradableInstrument.instrument.code;
      return (
        <Panel>
          {marketName ? (
            <>
              {t('Cancel all orders for')} <strong>{marketName}</strong>
            </>
          ) : (
            t('Cancel all orders')
          )}
        </Panel>
      );
    }
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
    const market = marketId && markets?.find((m) => m.id === marketId);
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
    const transferAsset = assets?.find((a) => a.id === asset);
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
    const rejectionReason =
      getRejectionReason(tx.order) || tx.order.rejectionReason || '';
    return (
      <>
        <ToastHeading>{getOrderToastTitle(tx.order.status)}</ToastHeading>
        {rejectionReason ? (
          <p>
            {t('Your order has been rejected because: %s', [rejectionReason])}
          </p>
        ) : (
          <p>{t('Your order has been rejected.')}</p>
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
