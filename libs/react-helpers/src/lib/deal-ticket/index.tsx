import { useCallback, useState } from 'react';
import { TypeSelector } from './type-selector';

export enum OrderType {
  Market = 'TYPE_MARKET',
  Limit = 'TYPE_LIMIT',
}

type OrderSide = 'SIDE_BUY' | 'SIDE_SELL' | null;

type OrderTimeInForce =
  | 'TIME_IN_FORCE_GTC'
  | 'TIME_IN_FORCE_GTT'
  | 'TIME_IN_FORCE_IOC'
  | 'TIME_IN_FORCE_FOK'
  | 'TIME_IN_FORCE_GFN'
  | 'TIME_IN_FORCE_GFA';

export interface LimitOrder {
  price: string;
  size: string;
  type: OrderType.Limit;
  timeInForce: OrderTimeInForce;
  side: OrderSide;
  expiration?: string;
}

export interface MarketOrder {
  size: string;
  type: OrderType.Market;
  timeInForce: OrderTimeInForce;
  side: OrderSide;
}

export type Order = LimitOrder | MarketOrder;

export const DealTicket = () => {
  const [order, setOrder] = useState<Order>({
    type: OrderType.Market,
    side: null,
    size: '0',
    timeInForce: 'TIME_IN_FORCE_IOC',
  });

  const updateOrder = useCallback((orderUpdate: Partial<Order>) => {
    // @ts-ignore Get around TS complaining about potential presence of price property
    setOrder((curr) => {
      return {
        ...curr,
        ...orderUpdate,
      };
    });
  }, []);

  let ticket = null;

  if (order.type === 'TYPE_MARKET') {
    ticket = <DealTicketMarket order={order} updateOrder={updateOrder} />;
  } else if (order.type === 'TYPE_LIMIT') {
    ticket = <DealTicketLimit order={order} updateOrder={updateOrder} />;
  } else {
    throw new Error('Invalid ticket type');
  }

  return <form className="px-4 py-8">{ticket}</form>;
};

interface DealTicketMarketProps {
  order: MarketOrder;
  updateOrder: (order: Partial<Order>) => void;
}

const DealTicketMarket = ({ order, updateOrder }: DealTicketMarketProps) => {
  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </>
  );
};

interface DealTicketLimitProps {
  order: LimitOrder;
  updateOrder: (order: Partial<Order>) => void;
}

const DealTicketLimit = ({ order, updateOrder }: DealTicketLimitProps) => {
  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </>
  );
};
