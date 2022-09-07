import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';

interface SideSelectorProps {
  value: Side;
  onSelect: (side: Side) => void;
}

export const SideSelector = ({ value, onSelect }: SideSelectorProps) => {
  const toggles = [
    { label: t('Long'), value: Side.SIDE_BUY },
    { label: t('Short'), value: Side.SIDE_SELL },
  ];

  return (
    <FormGroup label={t('Direction')} labelFor="order-side-toggle">
      <Toggle
        id="order-side-toggle"
        name="order-side"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as Side)}
      />
    </FormGroup>
  );
};
