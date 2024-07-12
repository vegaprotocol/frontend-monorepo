import { TicketInput } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { type FormControl } from '../use-form';

export const TakeProfit = (props: { control: FormControl }) => {
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
