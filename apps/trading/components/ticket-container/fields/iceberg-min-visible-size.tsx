import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';

export const IcebergMinVisibleSize = (props: { control: Control<any> }) => {
  const t = useT();
  const ticket = useTicketContext();
  const symbol = ticket.baseAsset ? ticket.baseAsset.symbol : ticket.baseSymbol;

  return (
    <FormField
      {...props}
      name="icebergMinVisibleSize"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            onChange={field.onChange}
            label={<InputLabel label={t('Min visible size')} symbol={symbol} />}
          />
        );
      }}
    />
  );
};
