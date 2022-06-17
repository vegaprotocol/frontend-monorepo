import { FormGroup, Select } from '@vegaprotocol/ui-toolkit';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/wallet';

interface TimeInForceSelectorProps {
  value: OrderTimeInForce;
  orderType: OrderType;
  onSelect: (tif: OrderTimeInForce) => void;
}

export const TimeInForceSelector = ({
  value,
  orderType,
  onSelect,
}: TimeInForceSelectorProps) => {
  const options =
    orderType === OrderType.Limit
      ? Object.entries(OrderTimeInForce)
      : Object.entries(OrderTimeInForce).filter(
          ([_, timeInForce]) =>
            timeInForce === OrderTimeInForce.FOK ||
            timeInForce === OrderTimeInForce.IOC
        );

  return (
    <FormGroup label="Time in force">
      <Select
        value={value}
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
