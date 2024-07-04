import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';

export const TakeProfit = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="takeProfit"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={
              <>
                <span>{t('Take profit')}</span>
                <span>quotename</span>
              </>
            }
            value={field.value}
            onChange={field.onChange}
          />
        );
      }}
    />
  );
};
