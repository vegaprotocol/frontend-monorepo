import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';

export const TakeProfit = (props: { control: Control<any> }) => {
  const t = useT();
  const ticket = useTicketContext();

  return (
    <FormField
      {...props}
      name="takeProfit"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={
              <InputLabel
                label={t('Take profit')}
                symbol={ticket.quoteAsset.symbol}
              />
            }
            value={field.value}
            onChange={field.onChange}
          />
        );
      }}
    />
  );
};
