import { FormField } from '../ticket-field';
import { TradingCheckbox as Checkbox } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { useForm } from '../use-form';

export const StopExpiry = () => {
  const t = useT();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="stopExpiry"
      render={({ field }) => {
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            label={t('Expiry')}
            name="order-stopExpiry"
          />
        );
      }}
    />
  );
};
