import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const TakeProfit = () => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name="takeProfit"
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={
                <InputLabel
                  label={t('Take profit')}
                  symbol={ticket.quoteAsset.symbol}
                />
              }
              value={field.value || ''}
              onChange={field.onChange}
            />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </div>
        );
      }}
    />
  );
};
