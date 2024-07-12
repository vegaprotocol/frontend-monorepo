import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { type FormControl } from '../use-form';

export const Price = ({
  control,
  name = 'price',
}: {
  control: FormControl;
  name?: 'price' | 'ocoPrice';
}) => {
  const t = useT();
  const ticket = useTicketContext();

  return (
    <FormField
      control={control}
      name={name}
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
