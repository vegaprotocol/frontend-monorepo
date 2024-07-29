import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

export const StopSizePosition = ({
  name = 'sizePosition',
}: {
  name?: 'sizePosition' | 'ocoSizePosition';
}) => {
  const form = useForm('stopLimit' as 'stopLimit' | 'stopMarket');

  const isOco = name === 'ocoSizePosition';
  const sizePctFieldName = isOco ? 'ocoSizePct' : 'sizePct';

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={<SizePositionLabel />}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e);
                form.setValue(sizePctFieldName, Number(e.target.value));
              }}
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

const SizePositionLabel = () => {
  const t = useT();
  const label = t('Quantity');
  const symbol = '%';

  return <InputLabel label={label} symbol={symbol} />;
};
