import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { OrderType } from '@vegaprotocol/wallet';
import { Toggle } from '@vegaprotocol/ui-toolkit';

interface TypeSelectorProps {
  value: OrderType;
  onSelect: (type: OrderType) => void;
}

const toggles = Object.entries(OrderType).map(([label, value]) => ({
  label,
  value,
}));

export const TypeSelector = ({ value, onSelect }: TypeSelectorProps) => {
  return (
    <FormGroup label="Order type" labelFor="order-type">
      <Toggle
        id="order-type"
        name="order-type"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as OrderType)}
      />
    </FormGroup>
  );
};
