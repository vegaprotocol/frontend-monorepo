import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';

export const IcebergPeakSize = (props: { control: Control<any> }) => {
  const t = useT();
  const ticket = useTicketContext();
  const symbol = ticket.baseAsset ? ticket.baseAsset.symbol : ticket.baseSymbol;

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
            label={
              <>
                <span className="text-default">{t('Peak size')}</span> {symbol}
              </>
            }
          />
        );
      }}
    />
  );
};
