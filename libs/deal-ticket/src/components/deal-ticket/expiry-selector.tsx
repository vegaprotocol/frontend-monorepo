import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/utils';
import type { UseFormRegister } from 'react-hook-form';
import { validateExpiration } from '../../utils/validate-expiration';
import type { DealTicketFormFields } from '.';

interface ExpirySelectorProps {
  value?: string;
  onSelect: (expiration: string | null) => void;
  errorMessage?: string;
  register?: UseFormRegister<DealTicketFormFields>;
}

export const ExpirySelector = ({
  value,
  onSelect,
  errorMessage,
  register,
}: ExpirySelectorProps) => {
  const date = value ? new Date(value) : new Date();
  const dateFormatted = formatForInput(date);
  const minDate = formatForInput(date);
  return (
    <FormGroup label={t('Expiry time/date')} labelFor="expiration">
      <Input
        data-testid="date-picker-field"
        id="expiration"
        type="datetime-local"
        value={dateFormatted}
        onChange={(e) => onSelect(e.target.value)}
        min={minDate}
        {...register?.('expiresAt', {
          validate: validateExpiration,
        })}
      />
      {errorMessage && (
        <InputError testId="dealticket-error-message-expiry">
          {errorMessage}
        </InputError>
      )}
    </FormGroup>
  );
};
