import { OrderType, OrderTypeMapping } from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useForm } from '../use-form';

export const OCOType = ({ name = 'ocoType' }: { name?: 'ocoType' }) => {
  const t = useT();
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <MiniSelect
            value={field.value}
            onValueChange={field.onChange}
            placeholder={t('Select')}
            data-testid={`order-${name}`}
          >
            <MiniSelectOption value={OrderType.TYPE_MARKET}>
              {OrderTypeMapping[OrderType.TYPE_MARKET]}
            </MiniSelectOption>
            <MiniSelectOption value={OrderType.TYPE_LIMIT}>
              {OrderTypeMapping[OrderType.TYPE_LIMIT]}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
