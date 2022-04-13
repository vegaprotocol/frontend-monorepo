import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { OrderSide } from '@vegaprotocol/wallet';
import type { TogglesArr } from '@vegaprotocol/ui-toolkit';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import type { Order } from './use-order-state';

interface SideSelectorProps {
  order: Order;
  onSelect: (side: OrderSide) => void;
}

export const SideSelector = ({ order, onSelect }: SideSelectorProps) => {
  const toggles = Object.entries(OrderSide).map(([label, value]) => ({
    label,
    value,
  }));

  return (
    <FormGroup label="Direction">
      <Toggle
        name="order-side"
        toggles={toggles as TogglesArr}
        checkedValue={order.side}
        onChange={(e) => onSelect(e.target.value as OrderSide)}
      />
    </FormGroup>
  );
};
