import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';

export const ExpiresAt = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="expiresAt"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={formatForInput(field.value)}
            onChange={(e) => {
              // zod schema is expecting a date
              field.onChange(new Date(e.target.value));
            }}
            label={t('Expiry time')}
            data-testid="date-picker-field"
            id="expiration"
            type="datetime-local"
            min={formatForInput(new Date())}
          />
        );
      }}
    />
  );
};
