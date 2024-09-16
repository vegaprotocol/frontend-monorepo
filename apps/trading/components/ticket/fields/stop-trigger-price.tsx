import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

// TODO: show warning about immediate trigger of order
export const StopTriggerPrice = ({
  name = 'triggerPrice',
}: {
  name?: 'triggerPrice' | 'ocoTriggerPrice';
}) => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  const typeFieldName =
    name === 'triggerPrice' ? 'triggerType' : 'ocoTriggerType';
  const triggerType = form.watch(typeFieldName);
  const symbol = triggerType === 'price' ? ticket.quoteSymbol : '%';

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              value={field.value || ''}
              label={<InputLabel label={t('Trigger')} symbol={symbol} />}
              data-testid={`order-${name}`}
            />
            {fieldState.error && (
              <TradingInputError testId={`error-${name}`}>
                {fieldState.error.message}
              </TradingInputError>
            )}
          </div>
        );
      }}
    />
  );
};
