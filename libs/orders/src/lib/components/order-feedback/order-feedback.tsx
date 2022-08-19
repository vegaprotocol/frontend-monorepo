import { useEnvironment } from '@vegaprotocol/environment';
import type { OrderEvent_busEvents_event_Order } from '../../order-hooks/__generated__';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { OrderStatus, OrderType, Side } from '@vegaprotocol/types';
import type { VegaTxState } from '@vegaprotocol/wallet';
import startCase from 'lodash/startCase';

export interface OrderFeedbackProps {
  transaction: VegaTxState;
  order: OrderEvent_busEvents_event_Order | null;
}

export const OrderFeedback = ({ transaction, order }: OrderFeedbackProps) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const labelClass = 'font-bold text-black dark:text-white';
  if (!order) return null;

  const orderRejectionReason = getRejectionReason(order);

  return (
    <div data-testid="order-confirmed">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {order.market && (
          <div>
            <p className={labelClass}>{t(`Market`)}</p>
            <p>{t(`${order.market.name}`)}</p>
          </div>
        )}
        <div>
          <p className={labelClass}>{t(`Status`)}</p>
          <p>{t(`${order.status}`)}</p>
        </div>
        {order.type === OrderType.Limit && order.market && (
          <div>
            <p className={labelClass}>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div>
          <p className={labelClass}>{t(`Size`)}</p>
          <p
            className={
              order.side === Side.Buy
                ? 'text-vega-green-dark dark:text-vega-green'
                : 'text-vega-red-dark dark:text-vega-red'
            }
          >
            {`${order.side === Side.Buy ? '+' : '-'} ${addDecimalsFormatNumber(
              order.size,
              order.market?.positionDecimalPlaces ?? 0
            )}
            `}
          </p>
        </div>
      </div>
      <div>
        {transaction.txHash && (
          <div>
            <p className={labelClass}>{t('Transaction')}</p>
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
      {orderRejectionReason && (
        <div>
          <p className={labelClass}>{t(`Reason`)}</p>
          <p data-testid="error-reason">{t(orderRejectionReason)}</p>
        </div>
      )}
    </div>
  );
};

const getRejectionReason = (
  order: OrderEvent_busEvents_event_Order
): string | null => {
  switch (order.status) {
    case OrderStatus.Stopped:
      return t(
        `Your ${order.timeInForce} order was not filled and it has been stopped`
      );
    case OrderStatus.Rejected:
      return order.rejectionReason && t(startCase(order.rejectionReason));
    default:
      return null;
  }
};
