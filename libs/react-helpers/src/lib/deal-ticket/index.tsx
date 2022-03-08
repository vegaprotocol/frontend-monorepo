import { Button, Input } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useState } from 'react';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';

export enum OrderType {
  Market = 'TYPE_MARKET',
  Limit = 'TYPE_LIMIT',
}

export enum OrderSide {
  Buy = 'SIDE_BUY',
  Sell = 'SIDE_SELL',
}

export enum OrderTimeInForce {
  GTC = 'TIME_IN_FORCE_GTC',
  GTT = 'TIME_IN_FORCE_GTT',
  IOC = 'TIME_IN_FORCE_IOC',
  FOK = 'TIME_IN_FORCE_FOK',
  GFN = 'TIME_IN_FORCE_GFN',
  GFA = 'TIME_IN_FORCE_GFA',
}

export interface LimitOrder {
  price: string;
  size: string;
  type: OrderType.Limit;
  timeInForce: OrderTimeInForce;
  side: OrderSide | null;
  expiration?: Date;
}

export interface MarketOrder {
  size: string;
  type: OrderType.Market;
  timeInForce: OrderTimeInForce;
  side: OrderSide | null;
}

export type Order = LimitOrder | MarketOrder;

export const DealTicket = () => {
  const [order, setOrder] = useState<Order>({
    type: OrderType.Limit,
    side: null,
    size: '0',
    price: '0',
    timeInForce: OrderTimeInForce.GTT,
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
  // If market ticket mounts with an invalid TIF update it to IOC
  useEffect(() => {
    if (
      order.timeInForce !== OrderTimeInForce.FOK &&
      order.timeInForce !== OrderTimeInForce.IOC
    ) {
      updateOrder({ timeInForce: OrderTimeInForce.IOC });
    }
  }, [order, updateOrder]);

  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
      <div className="flex items-center gap-8 mb-20">
        <div className="flex-1">
          <Input
            value={order.size}
            onChange={(e) => updateOrder({ size: e.target.value })}
            className="w-full"
          />
        </div>
        <div>@</div>
        <div className="flex-1">~3,201 DAI</div>
      </div>
      <TimeInForceSelector
        order={order}
        onSelect={(timeInForce) => updateOrder({ timeInForce })}
      />
      <Button className="w-full" variant="primary">
        Place order
      </Button>
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </>
  );
};

interface DealTicketLimitProps {
  order: LimitOrder;
  updateOrder: (order: Partial<Order>) => void;
}

const DealTicketLimit = ({ order, updateOrder }: DealTicketLimitProps) => {
  // If limit ticket mounts without a price set it to zero
  useEffect(() => {
    if (order.price === null || order.price === undefined) {
      updateOrder({ price: '0' });
    }
  }, [order, updateOrder]);

  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
      <div className="flex items-center gap-8 mb-20">
        <div className="flex-1">
          <Input
            value={order.size}
            onChange={(e) => updateOrder({ size: e.target.value })}
            className="w-full"
          />
        </div>
        <div>@</div>
        <div className="flex-1">
          <Input
            value={order.price}
            onChange={(e) => updateOrder({ price: e.target.value })}
            className="w-full"
          />
        </div>
      </div>
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
      <Button className="w-full" variant="primary">
        Place order
      </Button>
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </>
  );
};
