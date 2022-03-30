import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { OrderSide } from '@vegaprotocol/wallet';
import { ButtonRadio } from './button-radio';
import type { Order } from './use-order-state';

interface SideSelectorProps {
  order: Order;
  onSelect: (side: OrderSide) => void;
}

export const SideSelector = ({ order, onSelect }: SideSelectorProps) => {
  return (
    <FormGroup label="Direction">
      <ButtonRadio
        name="order-side"
        options={Object.entries(OrderSide).map(([text, value]) => ({
          text,
          value,
        }))}
        currentOption={order.side}
        onSelect={(value) => onSelect(value as OrderSide)}
      />
    </FormGroup>
  );
};
