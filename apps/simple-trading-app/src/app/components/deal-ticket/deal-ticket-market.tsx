import { addDecimal } from '@vegaprotocol/react-helpers';
import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import type { Order, DealTicketQuery_market } from '@vegaprotocol/deal-ticket';

interface DealTicketMarketProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  market: DealTicketQuery_market;
}

export const DealTicketMarket = ({
  order,
  updateOrder,
  market,
}: DealTicketMarketProps) => {
  return (
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
  );
};
