import { Button, Input } from '@vegaprotocol/ui-toolkit';
import {
  LimitOrder,
  MarketOrder,
  Order,
  OrderTimeInForce,
  OrderType,
  useOrderState,
} from '../../hooks/use-order-state';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';

const DEFAULT_ORDER: Order = {
  type: OrderType.Market,
  side: null,
  size: '0',
  timeInForce: OrderTimeInForce.FOK,
};

interface DealTicketProps {
  defaultOrder?: Order;
}

export const DealTicket = ({
  defaultOrder = DEFAULT_ORDER,
}: DealTicketProps) => {
  const [order, updateOrder] = useOrderState(defaultOrder);

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
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
      <div className="flex items-center gap-8 mb-20">
        <div className="flex-1">
          <Input
            value={order.size}
            onChange={(e) => updateOrder({ size: e.target.value })}
            className="w-full"
            data-testid="order-size"
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
            data-testid="order-size"
          />
        </div>
        <div>@</div>
        <div className="flex-1">
          <Input
            value={order.price}
            onChange={(e) => updateOrder({ price: e.target.value })}
            className="w-full"
            data-testid="order-price"
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
