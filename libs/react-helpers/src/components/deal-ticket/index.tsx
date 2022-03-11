import { Button, FormGroup, Input, Dialog } from '@vegaprotocol/ui-toolkit';
import { FormEvent, useEffect, useState } from 'react';
import {
  Order,
  OrderSide,
  OrderTimeInForce,
  OrderType,
  useOrderState,
} from '../../hooks/use-order-state';
import { ExpirySelector } from './expiry-selector';
import { OrderDialog } from './order-dialog';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import { useOrderSubmit } from './use-order-submit';
import { VegaTxStatus } from './use-vega-transaction';

const DEFAULT_ORDER: Order = {
  type: OrderType.Market,
  side: OrderSide.Buy,
  size: '1',
  timeInForce: OrderTimeInForce.IOC,
};

export interface Market {
  id: string;
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
  depth: {
    lastTrade: {
      price: string;
    } | null;
  };
}

export interface DealTicketProps {
  defaultOrder?: Order;
  market: Market;
}

export const DealTicket = ({
  defaultOrder = DEFAULT_ORDER,
  market,
}: DealTicketProps) => {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [order, updateOrder] = useOrderState(defaultOrder);
  const { submit, status, error, txHash, id } = useOrderSubmit(market.id);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(order);
  };

  useEffect(() => {
    if (
      status === VegaTxStatus.AwaitingConfirmation ||
      status === VegaTxStatus.Pending ||
      status === VegaTxStatus.Rejected
    ) {
      setOrderDialogOpen(true);
    }
  }, [status]);

  let ticket = null;

  if (order.type === 'TYPE_MARKET') {
    ticket = (
      <DealTicketMarket
        order={order}
        updateOrder={updateOrder}
        loading={
          status === VegaTxStatus.AwaitingConfirmation ||
          status === VegaTxStatus.Pending
        }
        market={market}
      />
    );
  } else if (order.type === 'TYPE_LIMIT') {
    ticket = (
      <DealTicketLimit
        order={order}
        updateOrder={updateOrder}
        loading={
          status === VegaTxStatus.AwaitingConfirmation ||
          status === VegaTxStatus.Pending
        }
        market={market}
      />
    );
  } else {
    throw new Error('Invalid ticket type');
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="px-4 py-8">
        {ticket}
      </form>
      <Dialog open={orderDialogOpen} setOpen={setOrderDialogOpen}>
        <OrderDialog status={status} txHash={txHash} error={error} id={id} />
      </Dialog>
    </>
  );
};

interface DealTicketMarketProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  loading: boolean;
  market: Market;
}

const DealTicketMarket = ({
  order,
  updateOrder,
  loading,
  market,
}: DealTicketMarketProps) => {
  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
      <div className="flex items-center gap-8">
        <div className="flex-1">
          <FormGroup label="Amount">
            <Input
              value={order.size}
              onChange={(e) => updateOrder({ size: e.target.value })}
              className="w-full"
              data-testid="order-size"
            />
          </FormGroup>
        </div>
        <div className="pt-4">@</div>
        <div className="flex-1 pt-4" data-testid="last-price">
          {market.depth.lastTrade ? (
            <>
              ~{market.depth.lastTrade.price}{' '}
              {market.tradableInstrument.instrument.product.quoteName}
            </>
          ) : (
            '-'
          )}
        </div>
      </div>
      <TimeInForceSelector
        order={order}
        onSelect={(timeInForce) => updateOrder({ timeInForce })}
      />
      <Button
        className="w-full"
        variant="primary"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Awaiting confirmation...' : 'Place order'}
      </Button>
    </>
  );
};

interface DealTicketLimitProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  loading: boolean;
  market: Market;
}

const DealTicketLimit = ({
  order,
  updateOrder,
  loading,
  market,
}: DealTicketLimitProps) => {
  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
      <div className="flex items-center gap-8">
        <div className="flex-1">
          <FormGroup label="Amount">
            <Input
              value={order.size}
              onChange={(e) => updateOrder({ size: e.target.value })}
              className="w-full"
              data-testid="order-size"
            />
          </FormGroup>
        </div>
        <div>@</div>
        <div className="flex-1">
          <FormGroup
            label={`Price (${market.tradableInstrument.instrument.product.quoteName})`}
            labelAlign="right"
          >
            <Input
              value={order.price}
              onChange={(e) => updateOrder({ price: e.target.value })}
              className="w-full"
              data-testid="order-price"
            />
          </FormGroup>
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
      <Button
        className="w-full"
        variant="primary"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Awaiting confirmation...' : 'Place order'}
      </Button>
    </>
  );
};
