import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { formatForInput } from '@vegaprotocol/utils';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { type FormControl } from '../use-form';

export const ExpiresAt = (props: { control: FormControl }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="expiresAt"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value ? formatForInput(field.value) : ''}
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
