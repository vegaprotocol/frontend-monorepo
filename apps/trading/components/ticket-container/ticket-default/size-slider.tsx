import type BigNumber from 'bignumber.js';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';

import { Slider } from '../elements/slider';
import { useTicketContext } from '../ticket-context';

import * as defaultUtils from './utils';
import * as utils from '../utils';
import { useForm } from '../use-form';
import { useState } from 'react';

export const SizeSlider = ({ price }: { price: BigNumber | undefined }) => {
  const [pct, setPct] = useState([0]);
  const form = useForm('limit');
  const ticket = useTicketContext('default');
  const { pubKey } = useVegaWallet();
  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  if (!price) return null;
  if (!ticket.market.riskFactors) return null;
  if (!ticket.market.tradableInstrument.marginCalculator?.scalingFactors) {
    return null;
  }

  return (
    <Slider
      min={0}
      max={100}
      step={0.1}
      value={pct}
      disabled={!price || price.isZero() || price.isNaN()}
      onValueChange={(value) => setPct(value)}
      onValueCommit={(value) => {
        setPct(value);
        const fields = form.getValues();
        const size = defaultUtils.calcSizeByPct({
          pct: value[0],
          openVolume,
          price,
          ticket,
          fields,
          orders: orders || [],
        });

        if (fields.sizeMode === 'contracts') {
          form.setValue('size', size.toNumber(), { shouldValidate: true });
        } else if (fields.sizeMode === 'notional') {
          const notional = utils.toNotional(size, price);
          form.setValue('size', notional.toNumber(), { shouldValidate: true });
        }
      }}
    />
  );
};
