import { FormField } from '../ticket-field';
import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const OCO = ({ name = 'oco' }: { name?: 'oco' }) => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={(value) => {
              field.onChange(value);
              form.setValue('stopExpiryStrategy', 'none');
            }}
            label={t('OCO')}
            name={name}
          />
        );
      }}
    />
  );
};
