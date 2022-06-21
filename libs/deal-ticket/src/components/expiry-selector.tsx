import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/react-helpers';

interface ExpirySelectorProps {
  value?: Date;
  onSelect: (expiration: Date | null) => void;
}

export const ExpirySelector = ({ value, onSelect }: ExpirySelectorProps) => {
  const date = value ? new Date(value) : new Date();
  const dateFormatted = formatForInput(date);
  const minDate = formatForInput(date);
  return (
    <FormGroup label="Expiry time/date">
      <Input
        data-testid="date-picker-field"
        id="expiration"
        name="expiration"
        type="datetime-local"
        value={dateFormatted}
        onChange={(e) => onSelect(new Date(e.target.value))}
        min={minDate}
      />
    </FormGroup>
  );
};
