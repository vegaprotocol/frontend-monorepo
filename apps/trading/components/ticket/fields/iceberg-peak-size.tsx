import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const IcebergPeakSize = () => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();
  const symbol =
    ticket.type === 'spot' ? ticket.baseAsset.symbol : ticket.baseSymbol;

  return (
    <FormField
      control={form.control}
      name="icebergPeakSize"
      render={({ field, fieldState }) => {
        return (
          <>
            <TicketInput
              {...field}
              value={field.value || ''}
              onChange={field.onChange}
              label={<InputLabel label={t('Peak size')} symbol={symbol} />}
              data-testid="order-peak-size"
            />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </>
        );
      }}
    />
  );
};
