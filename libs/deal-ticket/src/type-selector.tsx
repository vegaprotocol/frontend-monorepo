import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { OrderType } from '@vegaprotocol/wallet';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import type { Order } from './use-order-state';

interface TypeSelectorProps {
  order: Order;
  onSelect: (type: OrderType) => void;
}

export const TypeSelector = ({ order, onSelect }: TypeSelectorProps) => {
  const toggles = Object.entries(OrderType).map(([label, value]) => ({
    label,
    value,
  }));

  return (
    <FormGroup label="Order type">
      <Toggle
        name="order-type"
        toggles={toggles}
        checkedValue={order.type}
        onChange={(e) => onSelect(e.target.value as OrderType)}
      />
    </FormGroup>
  );
};
