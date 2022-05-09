import type { TransactionStatus } from './deal-ticket';
import { SideSelector } from './side-selector';
import { DealTicketMarketForm } from './deal-ticket-market-form';
import { SubmitButton } from './submit-button';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import type { Order } from './use-order-state';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { addDecimal } from '@vegaprotocol/react-helpers';

interface DealTicketMarketProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  transactionStatus: TransactionStatus;
  market: DealTicketQuery_market;
}

export const DealTicketMarket = ({
  order,
  updateOrder,
  transactionStatus,
  market,
}: DealTicketMarketProps) => {
  return (
    <>
      <TypeSelector order={order} onSelect={(type) => updateOrder({ type })} />
      <SideSelector order={order} onSelect={(side) => updateOrder({ side })} />
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
      <TimeInForceSelector
        order={order}
        onSelect={(timeInForce) => updateOrder({ timeInForce })}
      />
      <SubmitButton
        transactionStatus={transactionStatus}
        market={market}
        order={order}
      />
    </>
  );
};
