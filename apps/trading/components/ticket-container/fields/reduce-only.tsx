import { useFormContext, type Control } from 'react-hook-form';
import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';

export const ReduceOnly = (props: { control: Control<any> }) => {
  const t = useT();
  const form = useFormContext();
  return (
    <FormField
      {...props}
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
