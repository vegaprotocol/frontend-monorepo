import type BigNumber from 'bignumber.js';
import { useState } from 'react';

import { Slider } from '../elements/slider';
import { useTicketContext } from '../ticket-context';

import * as spotUtils from './utils';
import * as utils from '../utils';

import { useForm } from '../use-form';

export const SizeSliderStop = ({ price }: { price: BigNumber | undefined }) => {
  const [pct, setPct] = useState([0]);
  const form = useForm();
  const ticket = useTicketContext('spot');

  const ticketType = form.watch('ticketType');

  if (ticketType === 'market' || ticketType === 'limit') {
    throw new Error('cannot use stop slider unless ticketType is stop');
  }

  if (!price) return null;

  return (
    <Slider
      min={0}
      max={100}
      value={pct}
      disabled={!price || price.isZero() || price.isNaN()}
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

        form.setValue('size', sizeRounded.toNumber(), {
          shouldValidate: true,
        });
      }}
    />
  );
};
