import type BigNumber from 'bignumber.js';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';

import { Slider } from '../elements/slider';
import { useTicketContext } from '../ticket-context';

import * as defaultUtils from '../ticket-default/utils';
import * as utils from '../utils';
import { useForm } from '../use-form';
import { FormField } from '../ticket-field';

export const SizeSlider = ({ price }: { price: BigNumber | undefined }) => {
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
              const size = defaultUtils.calcSizeByPct({
                pct: value[0],
                openVolume,
                price,
                ticket,
                fields,
                orders: orders || [],
              });
              const notional = utils.toNotional(size, price);

              form.setValue('size', size.toNumber(), {
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
