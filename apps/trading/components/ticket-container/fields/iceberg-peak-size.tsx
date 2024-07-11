import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';

export const IcebergPeakSize = (props: { control: Control<any> }) => {
  const t = useT();
  const ticket = useTicketContext();
  const symbol =
    ticket.type === 'spot' ? ticket.baseAsset.symbol : ticket.baseSymbol;

  return (
    <FormField
      {...props}
      name="icebergPeakSize"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            onChange={field.onChange}
            label={<InputLabel label={t('Peak size')} symbol={symbol} />}
          />
        );
      }}
    />
  );
};
