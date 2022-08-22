import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { OrderType } from '@vegaprotocol/types';
import { Toggle } from '@vegaprotocol/ui-toolkit';

interface TypeSelectorProps {
  value: OrderType;
  onSelect: (type: OrderType) => void;
}

const toggles = [
  { label: t('Market'), value: OrderType.TYPE_MARKET },
  { label: t('Limit'), value: OrderType.TYPE_LIMIT },
];

export const TypeSelector = ({ value, onSelect }: TypeSelectorProps) => {
  return (
    <FormGroup label={t('Order type')} labelFor="order-type">
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
