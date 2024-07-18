import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';
import { useForm } from '../use-form';

export const StopSize = ({ name = 'size' }: { name?: 'size' | 'ocoSize' }) => {
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={<SizeLabel />}
              value={field.value || ''}
              onChange={field.onChange}
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

const SizeLabel = () => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();
  const sizeOverride = form.watch('sizeOverride');

  let label = t('Size');

  // If we have a baseAsset object use that,
  // otherwise fall back to using the value specified
  // in metadata tags
  let symbol =
    ticket.type === 'spot' ? ticket.baseAsset.symbol : ticket.baseSymbol;

  if (
    sizeOverride === StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
  ) {
    label = t('Quantity');
    symbol = '%';
  }

  return <InputLabel label={label} symbol={symbol} />;
};
