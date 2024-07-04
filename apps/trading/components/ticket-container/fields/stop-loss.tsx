import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';

export const StopLoss = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="stopLoss"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            onChange={field.onChange}
            label={t('Stop loss')}
          />
        );
      }}
    />
  );
};
