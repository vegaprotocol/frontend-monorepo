import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TradingInput } from '@vegaprotocol/ui-toolkit';

export const Size = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="size"
      render={({ field }) => {
        return (
          <TradingInput
            {...field}
            value={field.value}
            placeholder={t('Size')}
          />
        );
      }}
    />
  );
};
