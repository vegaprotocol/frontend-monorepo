import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { Order } from './use-order-state';
import { format } from 'date-fns';

interface ExpirySelectorProps {
  order: Order;
  onSelect: (expiration: Date | null) => void;
}

export const ExpirySelector = ({ order, onSelect }: ExpirySelectorProps) => {
  const date = order.expiration ? new Date(order.expiration) : new Date();
  const dateFormatted = format(date, "yyyy-MM-dd'T'HH:mm");
  return (
    <FormGroup label="Expiry time/date" labelFor="expiration">
      <Input
        id="expiration"
        name="expiration"
        type="datetime-local"
        value={dateFormatted}
        onChange={(e) => onSelect(new Date(e.target.value))}
        min={new Date().toISOString()}
      />
    </FormGroup>
  );
};
