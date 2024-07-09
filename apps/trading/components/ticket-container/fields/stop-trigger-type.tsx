import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';

export const StopTriggerType = ({
  control,
  name = 'triggerType',
}: {
  control: Control<any>;
  name?: string;
}) => {
  const t = useT();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <MiniSelect
            value={field.value}
            onValueChange={field.onChange}
            placeholder={t('Select')}
            data-testid="trigger-direction"
          >
            <MiniSelectOption value="price" id="triggerType-price">
              {t('Price')}
            </MiniSelectOption>
            <MiniSelectOption
              value="trailingPercentOffset"
              id="triggerType-trailingPercentOffset"
            >
              {t('Trailing Percent Offset')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
