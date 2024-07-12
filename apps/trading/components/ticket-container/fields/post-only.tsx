import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const PostOnly = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="postOnly"
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={(value) => {
              field.onChange(value);
              form.setValue('reduceOnly', false, { shouldValidate: true });
            }}
            label={t('Post only')}
          />
        );
      }}
    />
  );
};
