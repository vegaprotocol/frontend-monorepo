import { useState } from 'react';
import type BigNumber from 'bignumber.js';

import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';
import { Slider } from '../elements/slider';

import * as utils from '../utils';
import * as spotUtils from './utils';

/**
 * On change of the size slider calculate size
 * based on the sliders percentage value
 */
export const SizeSlider = ({ price }: { price: BigNumber | undefined }) => {
  const [pct, setPct] = useState([0]);
  const ticket = useTicketContext('spot');
  const form = useForm('market');

  if (!price) return null;

  return (
    <Slider
      min={0}
      max={100}
      step={0.1}
      value={pct}
      onValueChange={(value) => setPct(value)}
      onValueCommit={(value) => {
        setPct(value);
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
};
