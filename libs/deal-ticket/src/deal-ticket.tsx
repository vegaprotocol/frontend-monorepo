import type { FormEvent } from 'react';
import { OrderSide, OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import type { Order } from './use-order-state';
import { useOrderState } from './use-order-state';
import { DealTicketMarket } from './deal-ticket-market';
import { DealTicketLimit } from './deal-ticket-limit';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { toDecimal, removeDecimal } from '@vegaprotocol/react-helpers';

const getDefaultOrder = (market: DealTicketQuery_market): Order => ({
  type: OrderType.Market,
  side: OrderSide.Buy,
  size: String(toDecimal(market.positionDecimalPlaces)),
  timeInForce: OrderTimeInForce.IOC,
});

const prepareOrder = (
  market: DealTicketQuery_market,
  { type, side, size, timeInForce }: Order
): Order => ({
  type,
  side,
  size: removeDecimal(size, market.positionDecimalPlaces),
  timeInForce,
});

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: DealTicketQuery_market;
  submit: (order: Order) => void;
  transactionStatus: TransactionStatus;
  defaultOrder?: Order;
}

export const DealTicket = ({
  market,
  submit,
  transactionStatus,
  defaultOrder,
}: DealTicketProps) => {
  const [order, updateOrder] = useOrderState(
    defaultOrder || getDefaultOrder(market)
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(prepareOrder(market, order));
  };

  let ticket = null;

  if (order.type === OrderType.Market) {
    ticket = (
      <DealTicketMarket
        order={order}
        updateOrder={updateOrder}
        transactionStatus={transactionStatus}
        market={market}
      />
    );
  } else if (order.type === OrderType.Limit) {
    ticket = (
      <DealTicketLimit
        order={order}
        updateOrder={updateOrder}
        transactionStatus={transactionStatus}
        market={market}
      />
    );
  } else {
    throw new Error('Invalid ticket type');
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-8">
      {ticket}
    </form>
  );
};
