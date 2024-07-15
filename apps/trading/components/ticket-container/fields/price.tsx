import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const Price = ({ name = 'price' }: { name?: 'price' | 'ocoPrice' }) => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value || ''}
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
