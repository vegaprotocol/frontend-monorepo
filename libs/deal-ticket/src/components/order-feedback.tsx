import { useEnvironment } from '@vegaprotocol/environment';
import type { OrderEvent_busEvents_event_Order } from '@vegaprotocol/orders';
import {
  addDecimalsFormatNumber,
  formatLabel,
  t,
} from '@vegaprotocol/react-helpers';
import { OrderStatus, OrderType, Side } from '@vegaprotocol/types';
import { Icon } from '@vegaprotocol/ui-toolkit';
import type { VegaTxState } from '@vegaprotocol/wallet';
import { VegaTransactionDialogWrapper } from '@vegaprotocol/wallet';

interface OrderFeedbackProps {
  transaction: VegaTxState;
  order: OrderEvent_busEvents_event_Order | null;
}

export const OrderFeedback = ({ transaction, order }: OrderFeedbackProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  if (!order) return null;

  const title = getDialogTitle(order.status);

  // Order on network but was rejected
  if (order.status === OrderStatus.Rejected) {
    return (
      <VegaTransactionDialogWrapper
        title={title}
        icon={<Icon name="warning-sign" size={20} />}
      >
        <p data-testid="error-reason">
          {order.rejectionReason &&
            t(`Reason: ${formatLabel(order.rejectionReason)}`)}
        </p>
      </VegaTransactionDialogWrapper>
    );
  }

  return (
    <VegaTransactionDialogWrapper
      title={title}
      icon={<Icon name="tick" size={20} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {order.market && (
          <div>
            <p>{t(`Market`)}</p>
            <p>{t(`${order.market.name}`)}</p>
          </div>
        )}
        <div>
          <p>{t(`Status`)}</p>
          <p>{t(`${order.status}`)}</p>
        </div>
        {order.type === OrderType.Limit && order.market && (
          <div>
            <p>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div>
          <p>{t(`Amount`)}</p>
          <p
            className={
              order.side === Side.Buy ? 'text-vega-green' : 'text-vega-red'
            }
          >
            {`${order.side === Side.Buy ? '+' : '-'} ${order.size}
            `}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {transaction.txHash && (
          <div>
            <p>{t('Transaction')}</p>
            <a
              className="underline break-words"
              data-testid="tx-block-explorer"
              href={`${VEGA_EXPLORER_URL}/txs/0x${transaction.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {transaction.txHash}
            </a>
          </div>
        )}
      </div>
    </VegaTransactionDialogWrapper>
  );
};

const getDialogTitle = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Active:
      return 'Order submitted';
    case OrderStatus.Filled:
      return 'Order filled';
    case OrderStatus.PartiallyFilled:
      return 'Order partially filled';
    case OrderStatus.Parked:
      return 'Order parked';
    default:
      return 'Submission failed';
  }
};
