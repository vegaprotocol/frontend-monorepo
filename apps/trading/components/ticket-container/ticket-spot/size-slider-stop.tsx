import type BigNumber from 'bignumber.js';
import { useState } from 'react';

import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';

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
  const sizeOverride = form.watch('sizeOverride');

  if (ticketType === 'market' || ticketType === 'limit') {
    throw new Error('cannot use stop slider unless ticketType is stop');
  }

  if (!price) return null;
  if (!ticket.market.riskFactors) return null;
  if (!ticket.market.tradableInstrument.marginCalculator?.scalingFactors) {
    return null;
  }

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

        if (
          sizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
        ) {
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
        }

        if (
          sizeOverride ===
          StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
        ) {
          form.setValue('size', value[0], { shouldValidate: true });
        }
      }}
    />
  );
};
