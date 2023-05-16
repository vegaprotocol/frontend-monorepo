import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';

interface ExpirySelectorProps {
  value?: string;
  onSelect: (expiration: string | null) => void;
  errorMessage?: string;
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
    <FormGroup
      label={t('Expiry time/date')}
      labelFor="expiration"
      compact={true}
    >
      <Input
        data-testid="date-picker-field"
        id="expiration"
        type="datetime-local"
        value={dateFormatted}
        onChange={(e) => onSelect(e.target.value)}
        min={minDate}
      />
      {errorMessage && (
        <InputError testId="deal-ticket-error-message-expiry">
          {errorMessage}
        </InputError>
      )}
    </FormGroup>
  );
};
