import {
  type OrderTimeInForce,
  OrderTimeInForceCode,
  OrderTimeInForceMapping,
} from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';

import { FormField } from '../ticket-field';
import { TIF_OPTIONS, NON_PERSISTENT_TIF_OPTIONS } from '../constants';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

export const TimeInForce = () => {
  const t = useT();
  const form = useForm();
  const options = useOptions();

  return (
    <FormField
      control={form.control}
      name="timeInForce"
      render={({ field }) => {
        return (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-secondary" htmlFor={field.name}>
              {t('TIF')}
            </label>
            <MiniSelect
              id={field.name}
              name={field.name}
              placeholder="Select"
              value={field.value}
              onValueChange={(value) => {
                if (!value) return;
                field.onChange(value);
              }}
              trigger={OrderTimeInForceCode[field.value as OrderTimeInForce]}
              data-testid="order-tif"
            >
              {options.map((tif) => (
                <MiniSelectOption key={tif} value={tif}>
                  {OrderTimeInForceMapping[tif as OrderTimeInForce]}
                </MiniSelectOption>
              ))}
            </MiniSelect>
          </div>
        );
      }}
    />
  );
};

const useOptions = () => {
  const ticket = useTicketContext();
  const form = useForm();
  const ticketType = form.watch('ticketType');

  if (ticket.type === 'default') {
    if (ticketType === 'limit') {
      return TIF_OPTIONS;
    }

    return NON_PERSISTENT_TIF_OPTIONS;
  }

  if (ticket.type === 'spot') {
    if (ticketType === 'limit') {
      return TIF_OPTIONS;
    }
  }

  return TIF_OPTIONS;
};
