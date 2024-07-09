import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';

export const OCO = (props: { control: Control<any> }) => {
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
