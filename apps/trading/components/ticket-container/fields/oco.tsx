import { FormField } from '../ticket-field';
import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { type FormControl } from '../use-form';

export const OCO = (props: { control: FormControl }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="oco"
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            label={t('OCO')}
          />
        );
      }}
    />
  );
};
