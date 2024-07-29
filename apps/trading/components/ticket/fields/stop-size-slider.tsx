import type BigNumber from 'bignumber.js';

import { useActiveOrders } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useOpenVolume } from '@vegaprotocol/positions';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';

import { Slider } from '../elements/slider';
import { useTicketContext } from '../ticket-context';

import { useForm } from '../use-form';
import { FormField } from '../ticket-field';

import * as derivativeUtils from '../derivative/utils';
import * as utils from '../utils';

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
              const isOco = name === 'ocoSizePct';
              const sizeFieldName = isOco ? 'ocoSize' : 'size';
              const notionalFieldName = isOco ? 'ocoNotional' : 'notional';
              const sizePositionFieldName = isOco
                ? 'ocoSizePosition'
                : 'sizePosition';

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

                const notional = utils.toNotional(size, price);

                form.setValue(sizeFieldName, size.toNumber(), {
                  shouldValidate: fields.sizeMode === 'contracts',
                });

                form.setValue(notionalFieldName, notional.toNumber(), {
                  shouldValidate: fields.sizeMode === 'notional',
                });
              }

              if (
                sizeOverride ===
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
              ) {
                form.setValue(sizePositionFieldName, value[0], {
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
