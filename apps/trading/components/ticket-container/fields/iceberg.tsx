import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { type FormControl } from '../use-form';

export const Iceberg = (props: { control: FormControl }) => {
  const t = useT();
  return (
    <FormField
      {...props}
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
