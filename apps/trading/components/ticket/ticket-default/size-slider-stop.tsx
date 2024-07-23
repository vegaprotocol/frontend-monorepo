import type BigNumber from 'bignumber.js';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';

import { Slider } from '../elements/slider';
import { useTicketContext } from '../ticket-context';

import * as defaultUtils from '../ticket-default/utils';
import { useForm } from '../use-form';
import { useState } from 'react';

export const SizeSliderStop = ({ price }: { price: BigNumber | undefined }) => {
  const [pct, setPct] = useState([0]);
  const form = useForm();
  const ticket = useTicketContext('default');
  const { pubKey } = useVegaWallet();
  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

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
          const size = defaultUtils.calcSizeByPct({
            pct: value[0],
            openVolume,
            price,
            ticket,
            fields,
            orders: orders || [],
          });

          form.setValue('size', size.toNumber(), { shouldValidate: true });
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
