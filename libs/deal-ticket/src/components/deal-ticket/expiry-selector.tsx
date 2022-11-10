import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/react-helpers';
import type { UseFormRegister } from 'react-hook-form';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { validateExpiration } from '../deal-ticket-validation/validate-expiration';
import type { DealTicketErrorMessage } from './deal-ticket-error';
import { DealTicketError } from './deal-ticket-error';
import { DEAL_TICKET_SECTION } from '../constants';

interface ExpirySelectorProps {
  value?: string;
  onSelect: (expiration: string | null) => void;
  errorMessage?: DealTicketErrorMessage;
  register?: UseFormRegister<OrderSubmissionBody['orderSubmission']>;
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
      <DealTicketError
        errorMessage={errorMessage}
        data-testid="dealticket-error-message-force"
        section={DEAL_TICKET_SECTION.EXPIRY}
      />
    </FormGroup>
  );
};
