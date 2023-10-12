import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';
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
  const t = useT();
  const minDateRef = useRef(new Date());

  return (
    <div className="mb-4">
      <TradingFormGroup
        label={t('Expiry time/date')}
        labelFor="expiration"
        compact
      >
        <TradingInput
          data-testid="date-picker-field"
          id="expiration"
          type="datetime-local"
          value={value && formatForInput(new Date(value))}
          onChange={(e) => onSelect(e.target.value)}
          min={formatForInput(minDateRef.current)}
          hasError={!!errorMessage}
        />
        {errorMessage && (
          <TradingInputError testId="deal-ticket-error-message-expiry">
            {errorMessage}
          </TradingInputError>
        )}
      </TradingFormGroup>
    </div>
  );
};
