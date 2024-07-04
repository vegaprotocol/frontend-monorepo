import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';

export const Price = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="price"
      render={({ field }) => {
        return (
          <TicketInput {...field} value={field.value} label={t('Price')} />
        );
      }}
    />
  );
};
