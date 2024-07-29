import type BigNumber from 'bignumber.js';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';

import { Slider } from '../elements/slider';
import { useTicketContext } from '../ticket-context';

import * as derivativeUtils from '../derivative/utils';
import { useForm } from '../use-form';
import { FormField } from '../ticket-field';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';

export const StopSizeSlider = ({
  name = 'sizePct',
  price,
}: {
  name?: 'sizePct' | 'ocoSizePct';
  price: BigNumber | undefined;
}) => {
  const form = useForm('stopLimit');
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
              const sizeFieldName = name === 'ocoSizePct' ? 'ocoSize' : 'size';

              const sizeOverride =
                name === 'ocoSizePct'
                  ? fields.ocoSizeOverride
                  : fields.sizeOverride;

              if (
                sizeOverride ===
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
              ) {
                const size = derivativeUtils.calcSizeByPct({
                  pct: value[0],
                  openVolume,
                  price,
                  ticket,
                  fields,
                  orders: orders || [],
                });

                form.setValue(sizeFieldName, size.toNumber(), {
                  shouldValidate: true,
                });
              }

              if (
                sizeOverride ===
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
              ) {
                form.setValue(sizeFieldName, value[0], {
                  shouldValidate: true,
                });
              }
            }}
          />
        );
      }}
    />
  );
};
