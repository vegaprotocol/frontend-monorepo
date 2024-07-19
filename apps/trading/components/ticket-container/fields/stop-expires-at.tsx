import { formatForInput } from '@vegaprotocol/utils';

import { FormField } from '../ticket-field';
import { useForm } from '../use-form';

export const StopExpiresAt = ({
  name = 'stopExpiresAt',
}: {
  name?: 'stopExpiresAt' | 'ocoStopExpiresAt';
}) => {
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <input
            {...field}
            value={field.value ? formatForInput(field.value) : ''}
            onChange={(e) => {
              // zod schema is expecting a date
              field.onChange(new Date(e.target.value));
            }}
            data-testid="date-picker-field"
            id="expiration"
            type="datetime-local"
            min={formatForInput(new Date())}
            className="appearance-none bg-transparent dark:color-scheme-dark text-xs"
          />
        );
      }}
    />
  );
};
