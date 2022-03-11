import { Button, FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { FormEvent } from 'react';
import {
  Order,
  OrderTimeInForce,
  OrderType,
  useOrderState,
} from '../../hooks/use-order-state';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import { useOrderSubmit } from './use-order-submit';

const DEFAULT_ORDER: Order = {
  type: OrderType.Limit,
  side: null,
  size: '0',
  timeInForce: OrderTimeInForce.GTT,
  price: '0',
};

export interface Market {
  id: string;
  tradableInstrument: {
    instrument: {
      product: {
        quoteName: string;
      };
    };
  };
  depth: {
    lastTrade: {
      price: string;
    };
  };
}

interface DealTicketProps {
  defaultOrder?: Order;
  market: Market;
}

export const DealTicket = ({
  defaultOrder = DEFAULT_ORDER,
  market,
}: DealTicketProps) => {
  const [order, updateOrder] = useOrderState(defaultOrder);
  const { submit, error, loading, txHash } = useOrderSubmit('ABC123');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(order);
  };

  let ticket = null;

  if (order.type === 'TYPE_MARKET') {
    ticket = (
      <DealTicketMarket
        order={order}
        updateOrder={updateOrder}
        error={error}
        loading={loading}
        txHash={txHash}
        market={market}
      />
    );
  } else if (order.type === 'TYPE_LIMIT') {
    ticket = (
      <DealTicketLimit
        order={order}
        updateOrder={updateOrder}
        error={error}
        loading={loading}
        txHash={txHash}
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

interface DealTicketMarketProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  error: string;
  loading: boolean;
  txHash: string;
  market: Market;
}

const DealTicketMarket = ({
  order,
  updateOrder,
  error,
  loading,
  txHash,
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
          ~{market.depth.lastTrade.price}{' '}
          {market.tradableInstrument.instrument.product.quoteName}
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
      {error && <InputError className="my-12">{error}</InputError>}
      {txHash && <p className="my-12">{txHash}</p>}
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </>
  );
};

interface DealTicketLimitProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  error: string;
  loading: boolean;
  txHash: string;
  market: Market;
}

const DealTicketLimit = ({
  order,
  updateOrder,
  error,
  loading,
  txHash,
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
      {error && <InputError className="my-12">{error}</InputError>}
      {txHash && <p className="my-12">{txHash}</p>}
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </>
  );
};
