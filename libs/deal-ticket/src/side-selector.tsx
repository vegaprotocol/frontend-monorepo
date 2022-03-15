import { FormGroup } from '@vegaprotocol/ui-toolkit';
<<<<<<< HEAD
import { OrderSide } from '@vegaprotocol/wallet';
import { ButtonRadio } from './button-radio';
import { Order } from './use-order-state';
=======
import { ButtonRadio } from './button-radio';
import { Order, OrderSide } from './use-order-state';
>>>>>>> 2dff3cd (add button radio component)

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
