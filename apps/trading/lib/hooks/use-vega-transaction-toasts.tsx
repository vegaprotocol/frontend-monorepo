import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import compact from 'lodash/compact';
import type {
  BatchMarketInstructionSubmissionBody,
  OrderAmendment,
  OrderBusEventFieldsFragment,
  OrderCancellationBody,
  OrderSubmission,
  VegaStoredTxState,
  WithdrawalBusEventFieldsFragment,
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
import { getRejectionReason, useOrderByIdQuery } from '@vegaprotocol/orders';
import { useMarketList } from '@vegaprotocol/market-list';
import first from 'lodash/first';
import type { Side } from '@vegaprotocol/types';
import { OrderStatusMapping } from '@vegaprotocol/types';

const intentMap: { [s in VegaTxStatus]: Intent } = {
  Default: Intent.Primary,
  Requested: Intent.Warning,
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Complete: Intent.Success,
};

const getIntent = (tx: VegaStoredTxState) => {
  if (tx.order?.rejectionReason) {
    return Intent.Danger;
  }
  return intentMap[tx.status];
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
  return (
    withdraw ||
    submitOrder ||
    cancelOrder ||
    editOrder ||
    batchMarketInstructions
  );
};

const Details = ({
  children,
  title = '',
}: {
  children: ReactNode;
  title?: string;
}) => (
  <div className="pt-[5px]" data-testid="vega-tx-details" title={title}>
    <div className="font-mono text-xs p-2 bg-neutral-100 rounded dark:bg-neutral-700 dark:text-white">
      {children}
    </div>
  </div>
);

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
  order?: OrderBusEventFieldsFragment;
}) => {
  const { data: markets } = useMarketList();
  const market = order
    ? order.market
    : markets?.find((m) => m.id === data.marketId);
  if (!market) return null;

  const price = order ? order.price : data.price;
  const size = order ? order.size : data.size;
  const side = order ? order.side : data.side;

  return (
    <Details>
      <h4 className="font-bold">
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
      {order && order.rejectionReason && (
        <p className="italic">{getRejectionReason(order)}</p>
      )}
    </Details>
  );
};

const EditOrderDetails = ({
  data,
  order,
}: {
  data: OrderAmendment;
  order?: OrderBusEventFieldsFragment;
}) => {
  const { data: orderById } = useOrderByIdQuery({
    variables: { orderId: data.orderId },
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
    <Details title={data.orderId}>
      <h4 className="font-bold">
        {order
          ? t(`Edit order - ${OrderStatusMapping[order.status].toLowerCase()}`)
          : t('Edit order')}
      </h4>
      <p>{market?.tradableInstrument.instrument.code}</p>
      <p>
        <s>{original}</s>
      </p>
      <p>{edited}</p>
      {order && order.rejectionReason && (
        <p className="italic">{getRejectionReason(order)}</p>
      )}
    </Details>
  );
};

const CancelOrderDetails = ({
  orderId,
  order,
}: {
  orderId: string;
  order?: OrderBusEventFieldsFragment;
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
    <Details title={orderId}>
      <h4 className="font-bold">
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
      {order && order.rejectionReason && (
        <p className="italic">{getRejectionReason(order)}</p>
      )}
    </Details>
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
        <Details>
          {t('Withdraw')} {num} {asset.symbol}
        </Details>
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
      return <Details>{t('Cancel all orders')}</Details>;
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
        <Details>
          {marketName
            ? `${t('Cancel all orders for')} ${marketName}`
            : t('Cancel all orders')}
        </Details>
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
        <Details>
          {t('Close position for')} {market.tradableInstrument.instrument.code}
        </Details>
      );
    }
  }

  if (isBatchMarketInstructionsTransaction(tx.body)) {
    return <Details>{t('Batch market instruction')}</Details>;
  }

  return null;
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
      </div>
    );
    return (
      <div>
        <h3 className="font-bold">{t('Funds unlocked')}</h3>
        <p>{t('Your funds have been unlocked for withdrawal')}</p>
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
        {completeWithdrawalButton}
      </div>
    );
  }

  if (isOrderSubmissionTransaction(tx.body) && tx.order?.rejectionReason) {
    return (
      <div>
        <h3 className="font-bold">{t('Order rejected')}</h3>
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

  return (
    <div>
      <h3 className="font-bold">{t('Confirmed')}</h3>
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
        intent: getIntent(tx),
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
        .filter((tx) => isTransactionTypeSupported(tx))
        .map(fromVegaTransaction),
    ];
  }, [fromVegaTransaction, vegaTransactions]);

  return toasts;
};
