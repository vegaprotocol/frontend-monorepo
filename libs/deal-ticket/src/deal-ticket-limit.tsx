import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { Market } from './deal-ticket';
import { ExpirySelector } from './expiry-selector';
import { SideSelector } from './side-selector';
import { SubmitButton } from './submit-button';
import { TimeInForceSelector } from './time-in-force-selector';
import { TypeSelector } from './type-selector';
import { Order, OrderTimeInForce } from './use-order-state';
import { VegaTxStatus } from './use-vega-transaction';

interface DealTicketLimitProps {
  order: Order;
  updateOrder: (order: Partial<Order>) => void;
  status: VegaTxStatus;
  market: Market;
}

export const DealTicketLimit = ({
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
