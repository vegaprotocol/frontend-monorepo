import { FormGroup, InputError } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

interface TypeSelectorProps {
  value: Schema.OrderType;
  onSelect: (type: Schema.OrderType) => void;
  errorMessage?: ReactNode;
}

const toggles = [
  { label: t('Market'), value: Schema.OrderType.TYPE_MARKET },
  { label: t('Limit'), value: Schema.OrderType.TYPE_LIMIT },
];

export const TypeSelector = ({
  value,
  onSelect,
  errorMessage,
}: TypeSelectorProps) => {
  return (
    <FormGroup label={t('Order type')} labelFor="order-type">
      <Toggle
        id="order-type"
        name="order-type"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as Schema.OrderType)}
      />
      {errorMessage && <InputError>{errorMessage}</InputError>}
    </FormGroup>
  );
};
