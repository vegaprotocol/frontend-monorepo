import { Dialog } from '@vegaprotocol/ui-toolkit';
import { FormEvent, useEffect, useState } from 'react';
import {
  Order,
  OrderSide,
  OrderTimeInForce,
  OrderType,
  useOrderState,
} from './use-order-state';
import { OrderDialog } from './order-dialog';
import { useOrderSubmit } from './use-order-submit';
import { VegaTxStatus } from './use-vega-transaction';
import { DealTicketMarket } from './deal-ticket-market';
import { DealTicketLimit } from './deal-ticket-limit';

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
