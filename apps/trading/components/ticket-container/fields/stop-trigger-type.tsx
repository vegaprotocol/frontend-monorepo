import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { type FormControl } from '../use-form';

export const StopTriggerType = ({
  control,
  name = 'triggerType',
}: {
  control: FormControl;
  name?: 'triggerType' | 'ocoTriggerType';
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
