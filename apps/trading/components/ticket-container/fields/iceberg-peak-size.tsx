import { type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';

export const IcebergPeakSize = (props: { control: Control<any> }) => {
  const t = useT();
  return (
    <FormField
      {...props}
      name="icebergPeakSize"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value}
            onChange={field.onChange}
            label={t('Peak size')}
          />
        );
      }}
    />
  );
};
