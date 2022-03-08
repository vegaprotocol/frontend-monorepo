import { Order, OrderTimeInForce, OrderType } from '.';
import { Select } from '@vegaprotocol/ui-toolkit';

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
      : Object.entries(OrderTimeInForce).filter(([key, value]) => {
          if (
            value === OrderTimeInForce.FOK ||
            value === OrderTimeInForce.IOC
          ) {
            return true;
          }
          return false;
        });

  return (
    <div className="flex gap-8 mb-12">
      <Select
        value={order.timeInForce}
        onChange={(e) => onSelect(e.target.value as OrderTimeInForce)}
        className="w-full"
      >
        {options.map(([key, value]) => {
          return (
            <option key={key} value={value}>
              {key}
            </option>
          );
        })}
      </Select>
    </div>
  );
};
