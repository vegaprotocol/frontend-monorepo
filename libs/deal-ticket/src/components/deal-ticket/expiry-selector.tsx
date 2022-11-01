import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import type { DealTicketErrorMessage } from './deal-ticket-error';
import { DealTicketError } from './deal-ticket-error';
import * as constants from '../constants';

interface ExpirySelectorProps {
  value?: string;
  onSelect: (expiration: string | null) => void;
  errorMessage?: DealTicketErrorMessage;
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
      <DealTicketError
        errorMessage={errorMessage}
        data-testid="dealticket-error-message-force"
        section={constants.DEAL_TICKET_SECTION_EXPIRY}
      />
    </FormGroup>
  );
};
