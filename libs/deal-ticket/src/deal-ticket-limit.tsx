import { OrderTimeInForce } from '@vegaprotocol/wallet';
import type { TransactionStatus } from './deal-ticket';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { SubmitButton } from './submit-button';
import { DealTicketLimitForm } from './deal-ticket-limit-form';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import type { Order } from './use-order-state';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';

interface DealTicketLimitProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  transactionStatus: TransactionStatus;
  market: DealTicketQuery_market;
}

export const DealTicketLimit = ({
  order,
  updateOrder,
  transactionStatus,
  market,
}: DealTicketLimitProps) => {
  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
      <DealTicketLimitForm
        price={order.price}
        size={order.size}
        quoteName={market.tradableInstrument.instrument.product.quoteName}
        onSizeChange={(size) => updateOrder({ size })}
        onPriceChange={(price) => updateOrder({ price })}
      />
      <TimeInForceSelector
        order={order}
        onSelect={(timeInForce) => updateOrder({ timeInForce })}
      />
      {order.timeInForce === OrderTimeInForce.GTT && (
        <ExpirySelector
          order={order}
          onSelect={(date) => {
            if (date) {
              updateOrder({ expiration: date });
            }
          }}
        />
      )}
      <SubmitButton
        transactionStatus={transactionStatus}
        market={market}
        order={order}
      />
    </>
  );
};
