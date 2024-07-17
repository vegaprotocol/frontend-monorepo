import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const IcebergMinVisibleSize = () => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();
  const symbol =
    ticket.type === 'spot' ? ticket.baseAsset.symbol : ticket.baseSymbol;

  return (
    <FormField
      control={form.control}
      name="icebergMinVisibleSize"
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              value={field.value || ''}
              onChange={field.onChange}
              label={
                <InputLabel label={t('Min visible size')} symbol={symbol} />
              }
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
