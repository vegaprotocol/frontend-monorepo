import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { VegaWalletOrderSide } from '@vegaprotocol/wallet';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';

interface SideSelectorProps {
  value: VegaWalletOrderSide;
  onSelect: (side: VegaWalletOrderSide) => void;
}

export const SideSelector = ({ value, onSelect }: SideSelectorProps) => {
  const toggles = Object.entries(VegaWalletOrderSide).map(([label, value]) => ({
    label,
    value,
  }));

  return (
    <FormGroup label={t('Direction')} labelFor="order-side-toggle">
      <Toggle
        id="order-side-toggle"
        name="order-side"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as VegaWalletOrderSide)}
      />
    </FormGroup>
  );
};
