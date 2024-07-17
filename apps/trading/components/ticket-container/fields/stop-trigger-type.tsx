import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const StopTriggerType = ({
  name = 'triggerType',
}: {
  name?: 'triggerType' | 'ocoTriggerType';
}) => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <MiniSelect
            value={field.value}
            onValueChange={field.onChange}
            placeholder={t('Select')}
            data-testid="trigger-direction"
          >
            <MiniSelectOption value="price" data-testid="triggerType-price">
              {t('Price')}
            </MiniSelectOption>
            <MiniSelectOption
              value="trailingPercentOffset"
              data-testid="triggerType-trailingPercentOffset"
            >
              {t('Trailing Percent Offset')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
