import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const TpSl = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
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
