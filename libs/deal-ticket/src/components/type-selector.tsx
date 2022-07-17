import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { VegaWalletOrderType } from '@vegaprotocol/wallet';
import { Toggle } from '@vegaprotocol/ui-toolkit';

interface TypeSelectorProps {
  value: VegaWalletOrderType;
  onSelect: (type: VegaWalletOrderType) => void;
}

const toggles = Object.entries(VegaWalletOrderType).map(([label, value]) => ({
  label,
  value,
}));

export const TypeSelector = ({ value, onSelect }: TypeSelectorProps) => {
  return (
    <FormGroup label={t('Order type')} labelFor="order-type">
      <Toggle
        id="order-type"
        name="order-type"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as VegaWalletOrderType)}
      />
    </FormGroup>
  );
};
