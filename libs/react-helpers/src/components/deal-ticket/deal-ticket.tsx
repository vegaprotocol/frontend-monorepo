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
import { addDecimal } from './decimals';
import { SubmitButton } from './submit-button';

const DEFAULT_ORDER: Order = {
  type: OrderType.Market,
  side: OrderSide.Buy,
  size: '1',
  timeInForce: OrderTimeInForce.IOC,
};

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
  const { submit, status, setStatus, error, txHash, id } = useOrderSubmit(
    market.id
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(order);
  };

  const getDialogIntent = (status: VegaTxStatus) => {
    if (status === VegaTxStatus.Rejected) {
      return 'danger';
    }

    return 'progress';
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
        status={status}
        market={market}
      />
    );
  } else if (order.type === 'TYPE_LIMIT') {
    ticket = (
      <DealTicketLimit
        order={order}
        updateOrder={updateOrder}
        status={status}
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
      <Dialog
        open={orderDialogOpen}
        setOpen={setOrderDialogOpen}
        intent={getDialogIntent(status)}
      >
        <OrderDialog
          status={status}
          setStatus={setStatus}
          txHash={txHash}
          error={error}
          id={id}
        />
      </Dialog>
    </>
  );
};

interface DealTicketMarketProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  status: VegaTxStatus;
  market: Market;
}

const DealTicketMarket = ({
  order,
  updateOrder,
  status,
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
              type="number"
              data-testid="order-size"
            />
          </FormGroup>
        </div>
        <div className="pt-4">@</div>
        <div className="flex-1 pt-4" data-testid="last-price">
          {market.depth.lastTrade ? (
            <>
              ~{addDecimal(market.depth.lastTrade.price, market.decimalPlaces)}{' '}
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
      <SubmitButton status={status} market={market} order={order} />
    </>
  );
};

interface DealTicketLimitProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  status: VegaTxStatus;
  market: Market;
}

const DealTicketLimit = ({
  order,
  updateOrder,
  status,
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
              type="number"
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
              type="number"
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
      <SubmitButton status={status} market={market} order={order} />
    </>
  );
};
