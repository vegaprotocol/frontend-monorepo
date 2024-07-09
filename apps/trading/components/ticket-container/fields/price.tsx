import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';

export const Price = (props: { control: Control<any> }) => {
  const t = useT();
  const ticket = useTicketContext();

  return (
    <FormField
      {...props}
      name="price"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            label={
              <InputLabel
                label={t('Price')}
                symbol={ticket.quoteAsset.symbol}
              />
            }
          />
        );
      }}
    />
  );
};
