import { addDecimal } from '@vegaprotocol/react-helpers';
import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { Market_market } from '@vegaprotocol/graphql';
import { TransactionStatus } from './deal-ticket';
import { SideSelector } from './side-selector';
import { SubmitButton } from './submit-button';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import { Order } from './use-order-state';

interface DealTicketMarketProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  transactionStatus: TransactionStatus;
  market: Market_market;
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
      <SubmitButton
        transactionStatus={transactionStatus}
        market={market}
        order={order}
      />
    </>
  );
};
