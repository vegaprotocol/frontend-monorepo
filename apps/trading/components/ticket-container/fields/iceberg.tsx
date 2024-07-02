import { type Control } from 'react-hook-form';
import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';

export const Iceberg = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="iceberg"
      render={({ field }) => {
        return (
          <Checkbox
            {...field}
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
