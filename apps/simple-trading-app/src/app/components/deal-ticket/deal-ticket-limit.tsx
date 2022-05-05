import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import type { Order, DealTicketQuery_market } from '@vegaprotocol/deal-ticket';

interface DealTicketLimitProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  market: DealTicketQuery_market;
}

export const DealTicketLimit = ({
  order,
  updateOrder,
  market,
}: DealTicketLimitProps) => {
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
  );
};
