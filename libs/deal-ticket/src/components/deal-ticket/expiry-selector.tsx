import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';

interface ExpirySelectorProps {
  value?: string;
  onSelect: (expiration: string | null) => void;
}

export const ExpirySelector = ({ value, onSelect }: ExpirySelectorProps) => {
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
    </FormGroup>
  );
};
