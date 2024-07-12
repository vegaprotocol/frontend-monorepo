import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const StopTrigger = ({
  control,
  name = 'trigger',
}: {
  control: Control<any>;
  name?: string;
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
