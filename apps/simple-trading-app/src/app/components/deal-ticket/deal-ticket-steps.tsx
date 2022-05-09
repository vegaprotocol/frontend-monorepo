import * as React from 'react';
import type { FormEvent } from 'react';
import Box from '@mui/material/Box';
import { Stepper } from '../stepper';
import type { Order, DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import {
  ExpirySelector,
  SideSelector,
  SubmitButton,
  TimeInForceSelector,
  TypeSelector,
  useOrderState,
  useOrderSubmit,
  DealTicketLimitForm,
  DealTicketMarketForm,
} from '@vegaprotocol/deal-ticket';
import {
  OrderSide,
  OrderTimeInForce,
  OrderType,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import { addDecimal } from '@vegaprotocol/react-helpers';

interface DealTicketMarketProps {
  market: DealTicketQuery_market;
}

const DEFAULT_ORDER: Order = {
  type: OrderType.Market,
  side: OrderSide.Buy,
  size: '1',
  timeInForce: OrderTimeInForce.IOC,
};

export const DealTicketSteps = ({ market }: DealTicketMarketProps) => {
  const [order, updateOrder] = useOrderState(DEFAULT_ORDER);
  const { submit, transaction } = useOrderSubmit(market);

  const transactionStatus =
    transaction.status === VegaTxStatus.Requested ||
    transaction.status === VegaTxStatus.Pending
      ? 'pending'
      : 'default';

  let ticket = null;

  if (order.type === OrderType.Market) {
    ticket = (
      <DealTicketMarketForm
        size={order.size}
        onSizeChange={(size) => updateOrder({ size })}
        price={
          market.depth.lastTrade
            ? addDecimal(market.depth.lastTrade.price, market.decimalPlaces)
            : undefined
        }
        quoteName={market.tradableInstrument.instrument.product.quoteName}
      />
    );
  } else if (order.type === OrderType.Limit) {
    ticket = (
      <DealTicketLimitForm
        price={order.price}
        size={order.size}
        quoteName={market.tradableInstrument.instrument.product.quoteName}
        onSizeChange={(size) => updateOrder({ size })}
        onPriceChange={(price) => updateOrder({ price })}
      />
    );
  } else {
    throw new Error('Invalid ticket type');
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    return submit(order);
  };

  const steps = [
    {
      label: 'Select Asset',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: <div />,
    },
    {
      label: 'Select Order Type',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <TypeSelector
          order={order}
          onSelect={(type) => updateOrder({ type })}
        />
      ),
    },
    {
      label: 'Select Market Position',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <SideSelector
          order={order}
          onSelect={(side) => updateOrder({ side })}
        />
      ),
    },
    {
      label: 'Select Order Size',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      component: ticket,
    },
    {
      label: 'Select Time In Force',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <>
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
        </>
      ),
    },
    {
      label: 'Review & Submit Order',
      description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      component: (
        <Box sx={{ mb: 2 }}>
          <SubmitButton
            transactionStatus={transactionStatus}
            market={market}
            order={order}
          />
        </Box>
      ),
      disabled: true,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="px-4 py-8">
      <Stepper steps={steps} />
    </form>
  );
};
