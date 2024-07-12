import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const Iceberg = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="iceberg"
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={(value) => {
              field.onChange(value);
            }}
            label={t('Iceberg')}
          />
        );
      }}
    />
  );
};
