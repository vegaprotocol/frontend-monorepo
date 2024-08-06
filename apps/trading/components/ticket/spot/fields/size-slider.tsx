import type BigNumber from 'bignumber.js';

import { Slider } from '../../elements/slider';
import { useTicketContext } from '../../ticket-context';

import { useForm } from '../../use-form';
import { FormField } from '../../ticket-field';

import * as utils from '../../utils';
import * as spotUtils from '../utils';

export const SizeSlider = ({ price }: { price: BigNumber | undefined }) => {
  const form = useForm('limit');
  const ticket = useTicketContext('spot');

  if (!price) return null;

  return (
    <FormField
      control={form.control}
      name="sizePct"
      render={({ field }) => {
        return (
          <Slider
            min={0}
            max={100}
            step={0.1}
            value={[field.value ?? 0]}
            disabled={!price || price.isZero() || price.isNaN()}
            onValueChange={(value) => field.onChange(value[0])}
            onValueCommit={(value) => {
              field.onChange(value[0]);
              const fields = form.getValues();

              const max = spotUtils.calcMaxSize({
                side: fields.side,
                price,
                ticket,
              });

              const size = utils.toPercentOf(value[0], max);
              const sizeRounded = utils.roundToPositionDecimals(
                size,
                ticket.market.positionDecimalPlaces
              );

              const notional = utils.toNotional(sizeRounded, price);

              form.setValue('size', sizeRounded.toNumber(), {
                shouldValidate: fields.sizeMode === 'contracts',
              });
              form.setValue('notional', notional.toNumber(), {
                shouldValidate: fields.sizeMode === 'notional',
              });
            }}
          />
        );
      }}
    />
  );
};
