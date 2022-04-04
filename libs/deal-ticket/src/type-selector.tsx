import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { OrderType } from '@vegaprotocol/wallet';
import { ButtonRadio } from './button-radio';
import type { Order } from './use-order-state';

interface TypeSelectorProps {
  order: Order;
  onSelect: (type: OrderType) => void;
}

export const TypeSelector = ({ order, onSelect }: TypeSelectorProps) => {
  return (
    <FormGroup label="Order type">
      <ButtonRadio
        name="order-type"
        options={Object.entries(OrderType).map(([text, value]) => ({
          text,
          value,
        }))}
        currentOption={order.type}
        onSelect={(value) => onSelect(value as OrderType)}
      />
    </FormGroup>
  );
};
