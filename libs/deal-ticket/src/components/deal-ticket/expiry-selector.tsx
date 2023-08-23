import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useRef } from 'react';

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
  const now = useRef(new Date());
  const date = value ? new Date(value) : now.current;
  const dateFormatted = formatForInput(date);
  const minDate = formatForInput(date);
  return (
    <TradingFormGroup
      label={t('Expiry time/date')}
      labelFor="expiration"
      compact={true}
    >
      <TradingInput
        data-testid="date-picker-field"
        id="expiration"
        type="datetime-local"
        value={dateFormatted}
        onChange={(e) => onSelect(e.target.value)}
        min={minDate}
        hasError={!!errorMessage}
      />
      {errorMessage && (
        <TradingInputError testId="deal-ticket-error-message-expiry">
          {errorMessage}
        </TradingInputError>
      )}
    </TradingFormGroup>
  );
};
