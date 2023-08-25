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
          min={formatForInput(useRef(new Date()).current)}
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
