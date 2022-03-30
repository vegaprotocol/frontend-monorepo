import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import type { Order } from './use-order-state';
import { formatForInput } from '@vegaprotocol/react-helpers';

interface ExpirySelectorProps {
  order: Order;
  onSelect: (expiration: Date | null) => void;
}

export const ExpirySelector = ({ order, onSelect }: ExpirySelectorProps) => {
  const date = order.expiration ? new Date(order.expiration) : new Date();
  const dateFormatted = formatForInput(date);
  const minDate = formatForInput(date);
  return (
    <FormGroup label="Expiry time/date" labelFor="expiration">
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
