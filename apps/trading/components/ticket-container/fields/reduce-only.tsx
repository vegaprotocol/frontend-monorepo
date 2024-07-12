import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const ReduceOnly = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="reduceOnly"
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={(value) => {
              field.onChange(value);
              form.setValue('postOnly', false, { shouldValidate: true });
            }}
            label={t('Reduce only')}
          />
        );
      }}
    />
  );
};
