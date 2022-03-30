import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';
import type { Order } from './use-order-state';

interface TimeInForceSelectorProps {
  order: Order;
  onSelect: (tif: OrderTimeInForce) => void;
}

export const TimeInForceSelector = ({
  order,
  onSelect,
}: TimeInForceSelectorProps) => {
  const options =
    order.type === OrderType.Limit
      ? Object.entries(OrderTimeInForce)
      : Object.entries(OrderTimeInForce).filter(
          ([key, value]) =>
            value === OrderTimeInForce.FOK || value === OrderTimeInForce.IOC
        );

  return (
    <FormGroup label="Time in force">
      <Select
        value={order.timeInForce}
        onChange={(e) => onSelect(e.target.value as OrderTimeInForce)}
        className="w-full"
        data-testid="order-tif"
      >
        {options.map(([key, value]) => {
          return (
            <option key={key} value={value}>
              {key}
            </option>
          );
        })}
      </Select>
    </FormGroup>
  );
};
