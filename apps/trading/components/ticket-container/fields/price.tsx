import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TradingInput } from '@vegaprotocol/ui-toolkit';

export const Price = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="price"
      render={({ field }) => {
        return (
          <TradingInput
            {...field}
            value={field.value}
            placeholder={t('Price')}
          />
        );
      }}
    />
  );
};
