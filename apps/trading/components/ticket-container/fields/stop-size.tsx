import { useFormContext, type Control } from 'react-hook-form';

import { TicketInput } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';

export const StopSize = ({
  control,
  name = 'size',
}: {
  control: Control<any>;
  name?: string;
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={<SizeLabel />}
            value={field.value}
            onChange={field.onChange}
          />
        );
      }}
    />
  );
};

const SizeLabel = () => {
  const t = useT();
  const form = useFormContext();
  const ticket = useTicketContext();
  const sizeOverride = form.watch('sizeOverride');

  let label = t('Size');

  // If we have a baseAsset object use that,
  // otherwise fall back to using the value specified
  // in metadata tags
  let symbol = ticket.baseAsset ? ticket.baseAsset.symbol : ticket.baseSymbol;

  if (
    sizeOverride === StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
  ) {
    label = t('Quantity');
    symbol = '%';
  }

  return <InputLabel label={label} symbol={symbol} />;
};
