import { TicketInput } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { type FormControl, useForm } from '../use-form';

export const StopTrigger = ({
  control,
  name = 'trigger',
}: {
  control: FormControl;
  name?: 'trigger' | 'ocoTrigger';
}) => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  const triggerType = form.watch('triggerType');
  const symbol = triggerType === 'price' ? ticket.quoteAsset.symbol : '%';

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            label={<InputLabel label={t('Trigger')} symbol={symbol} />}
          />
        );
      }}
    />
  );
};
