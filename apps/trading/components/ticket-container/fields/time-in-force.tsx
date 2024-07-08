import { useFormContext, type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import {
  OrderTimeInForce,
  OrderTimeInForceCode,
  OrderTimeInForceMapping,
  OrderType,
} from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { NON_PERSISTENT_TIF_OPTIONS } from '../constants';

export const TimeInForce = (props: { control: Control<any> }) => {
  const t = useT();
  const form = useFormContext();

  const type = form.watch('type');
  const options =
    type === OrderType.TYPE_MARKET
      ? NON_PERSISTENT_TIF_OPTIONS
      : Object.values(OrderTimeInForce);

  return (
    <FormField
      {...props}
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
