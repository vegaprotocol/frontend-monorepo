import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TradingInput } from '@vegaprotocol/ui-toolkit';

export const IcebergPeakSize = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="icebergPeakSize"
      render={({ field }) => {
        return (
          <TradingInput
            {...field}
            value={field.value}
            onChange={field.onChange}
            placeholder={t('Peak size')}
          />
        );
      }}
    />
  );
};
