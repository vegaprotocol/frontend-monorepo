import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';

export const StopLoss = (props: { control: Control<any> }) => {
  const t = useT();
  const ticket = useTicketContext();

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
            label={
              <>
                <span className="text-default">{t('Stop loss')}</span>{' '}
                {ticket.quoteAsset.symbol}
              </>
            }
          />
        );
      }}
    />
  );
};
