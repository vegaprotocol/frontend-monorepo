import { TicketInput } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const StopLoss = () => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name="stopLoss"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            onChange={field.onChange}
            label={
              <InputLabel
                label={t('Stop loss')}
                symbol={ticket.quoteAsset.symbol}
              />
            }
          />
        );
      }}
    />
  );
};
