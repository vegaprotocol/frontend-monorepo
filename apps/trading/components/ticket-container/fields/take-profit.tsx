import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TradingInput } from '@vegaprotocol/ui-toolkit';

export const TakeProfit = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="takeProfit"
      render={({ field }) => {
        return (
          <TradingInput
            {...field}
            placeholder={t('Take profit')}
            value={field.value}
            onChange={field.onChange}
          />
        );
      }}
    />
  );
};
