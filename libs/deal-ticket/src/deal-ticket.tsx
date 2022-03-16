import { OrderSide, OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import { FormEvent } from 'react';
import { Order, useOrderState } from './use-order-state';
import { DealTicketMarket } from './deal-ticket-market';
import { DealTicketLimit } from './deal-ticket-limit';

const DEFAULT_ORDER: Order = {
  type: OrderType.Market,
  side: OrderSide.Buy,
  size: '1',
  timeInForce: OrderTimeInForce.IOC,
};

// TODO: Consider using a generated type when we have a better solution for
// sharing the types from GQL
export interface Market {
  id: string;
  decimalPlaces: number;
  tradableInstrument: {
    instrument: {
      product: {
        quoteName: string;
        settlementAsset: {
          id: string;
          symbol: string;
          name: string;
        };
      };
    };
  };
  tradingMode:
    | 'BatchAuction'
    | 'Continuous'
    | 'MonitoringAuction'
    | 'OpeningAuction';
  state:
    | 'Active'
    | 'Cancelled'
    | 'Closed'
    | 'Pending'
    | 'Proposed'
    | 'Rejected'
    | 'Settled'
    | 'Suspended'
    | 'TradingTerminated';
  depth: {
    lastTrade: {
      price: string;
    } | null;
  };
}

export type TransactionStatus = 'default' | 'pending';

export interface DealTicketProps {
  market: Market;
  submit: (order: Order) => void;
  transactionStatus: TransactionStatus;
  defaultOrder?: Order;
}

export const DealTicket = ({
  market,
  submit,
  transactionStatus,
  defaultOrder = DEFAULT_ORDER,
}: DealTicketProps) => {
  const [order, updateOrder] = useOrderState(defaultOrder);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(order);
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
