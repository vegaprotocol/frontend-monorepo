import type { ReactNode } from 'react';
import { FormGroup, InputError } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { Toggle } from '@vegaprotocol/ui-toolkit';

interface TypeSelectorProps {
  value: Schema.OrderType;
  onSelect: (type: Schema.OrderType) => void;
  errorMessage?: { message: ReactNode | string; isDisabled: boolean };
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
      {errorMessage && (
        <div className="mb-6 -mt-2">
          <InputError
            intent={errorMessage.isDisabled ? 'danger' : 'warning'}
            data-testid="dealticket-error-message-price"
          >
            {errorMessage.message}
          </InputError>
        </div>
      )}
    </FormGroup>
  );
};
