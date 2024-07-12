import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { type FormControl } from '../use-form';

export const TpSl = (props: { control: FormControl }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="tpSl"
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            label={t('TP/SL')}
          />
        );
      }}
    />
  );
};
