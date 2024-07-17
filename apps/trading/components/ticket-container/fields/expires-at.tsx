import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const ExpiresAt = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="expiresAt"
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              value={field.value ? formatForInput(field.value) : ''}
              onChange={(e) => {
                // zod schema is expecting a date
                field.onChange(new Date(e.target.value));
              }}
              label={t('Expiry time')}
              data-testid="date-picker-field"
              type="datetime-local"
              min={formatForInput(new Date())}
            />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </div>
        );
      }}
    />
  );
};
