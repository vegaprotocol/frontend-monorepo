import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';

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
              <>
                <span className="text-default">{t('Take profit')}</span>{' '}
                {ticket.quoteAsset.symbol}
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
