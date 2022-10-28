import type { ReactNode } from 'react';
import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';

interface ExpirySelectorProps {
  value?: string;
  onSelect: (expiration: string | null) => void;
  errorMessage?: { message: ReactNode | string; isDisabled: boolean };
}

export const ExpirySelector = ({
  value,
  onSelect,
  errorMessage,
}: ExpirySelectorProps) => {
  const date = value ? new Date(value) : new Date();
  const dateFormatted = formatForInput(date);
  const minDate = formatForInput(date);
  return (
    <FormGroup label={t('Expiry time/date')} labelFor="expiration">
      <Input
        data-testid="date-picker-field"
        id="expiration"
        name="expiration"
        type="datetime-local"
        value={dateFormatted}
        onChange={(e) => onSelect(e.target.value)}
        min={minDate}
      />
      {errorMessage && (
        <div className="mb-6 -mt-2">
          <InputError
            intent={errorMessage.isDisabled ? 'danger' : 'warning'}
            data-testid="dealticket-error-message-expiry"
          >
            {errorMessage.message}
          </InputError>
        </div>
      )}
    </FormGroup>
  );
};
