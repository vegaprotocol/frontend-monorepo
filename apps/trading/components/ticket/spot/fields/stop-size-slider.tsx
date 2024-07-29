import type BigNumber from 'bignumber.js';

import { Slider } from '../../elements/slider';
import { useTicketContext } from '../../ticket-context';

import { useForm } from '../../use-form';
import { FormField } from '../../ticket-field';

import * as spotUtils from '../utils';
import * as utils from '../../utils';

export const StopSizeSlider = ({
  name = 'sizePct',
  price,
}: {
  name?: 'sizePct' | 'ocoSizePct';
  price: BigNumber | undefined;
}) => {
  const form = useForm('stopLimit');
  const ticket = useTicketContext('spot');

  if (!price) return null;

  return (
    <FormField
      control={form.control}
      name={name}
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
              const isOco = name === 'ocoSizePct';
              const sizeFieldName = isOco ? 'ocoSize' : 'size';
              const notionalFieldName = isOco ? 'ocoNotional' : 'notional';

              const max = spotUtils.calcMaxSize({
                side: fields.side,
                price,
                ticket,
              });
              const size = utils.toPercentOf(value[0], max);
              const notional = utils.toNotional(size, price);
              const sizeRounded = utils.roundToPositionDecimals(
                size,
                ticket.market.positionDecimalPlaces
              );

              form.setValue(sizeFieldName, sizeRounded.toNumber(), {
                shouldValidate: fields.sizeMode === 'contracts',
              });

              form.setValue(notionalFieldName, notional.toNumber(), {
                shouldValidate: fields.sizeMode === 'notional',
              });
            }}
          />
        );
      }}
    />
  );
};
