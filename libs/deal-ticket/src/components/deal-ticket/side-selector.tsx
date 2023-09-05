import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import * as Schema from '@vegaprotocol/types';

interface SideSelectorProps {
  value: Schema.Side;
  onSelect: (side: Schema.Side) => void;
}

export const SideSelector = ({ value, onSelect }: SideSelectorProps) => {
  const toggles = [
    { label: t('Long'), value: Schema.Side.SIDE_BUY },
    { label: t('Short'), value: Schema.Side.SIDE_SELL },
  ];

  const toggleType = (e: Schema.Side) => {
    switch (e) {
      case Schema.Side.SIDE_BUY:
        return 'buy';
      case Schema.Side.SIDE_SELL:
        return 'sell';
      default:
        return 'primary';
    }
  };

  return (
    <FormGroup
      label={t('Direction')}
      labelFor="order-side-toggle"
      compact={true}
    >
      <Toggle
        id="order-side-toggle"
        name="order-side"
        toggles={toggles}
        checkedValue={value}
        type={toggleType(value)}
        onChange={(e) => {
          onSelect(e.target.value as Schema.Side);
        }}
      />
    </FormGroup>
  );
};
