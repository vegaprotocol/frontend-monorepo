import type BigNumber from 'bignumber.js';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';
import { MiniSelect, MiniSelectOption } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useOpenVolume } from '@vegaprotocol/positions';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useForm } from '../use-form';
import { useTicketContext } from '../ticket-context';

import * as derivativeUtils from '../derivative/utils';
import * as utils from '../utils';

export const StopSizeOverride = ({
  name = 'sizeOverride',
  price,
}: {
  name?: 'sizeOverride' | 'ocoSizeOverride';
  price: BigNumber | undefined;
}) => {
  const t = useT();
  const ticket = useTicketContext('default');
  const form = useForm('stopLimit' as 'stopLimit' | 'stopMarket');

  const { pubKey } = useVegaWallet();
  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <MiniSelect
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);

              const fields = form.getValues();
              const isOco = name === 'ocoSizeOverride';
              const sizeFieldName = isOco ? 'ocoSize' : 'size';
              const notionalFieldName = isOco ? 'ocoNotional' : 'notional';
              const sizePctFieldName = isOco ? 'ocoSizePct' : 'sizePct';
              const sizePositionFieldName = isOco
                ? 'ocoSizePosition'
                : 'sizePosition';
              const pctValue = isOco ? fields.ocoSizePct : fields.sizePct;

              if (
                value ===
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
              ) {
                form.setValue(sizePositionFieldName, pctValue);
              } else {
                if (!price) {
                  form.setValue(sizeFieldName, 0);
                  form.setValue(notionalFieldName, 0);
                  form.setValue(sizePctFieldName, 0);
                  return;
                }

                if (!pctValue) {
                  return;
                }

                // Changing back to normal size input mode,
                const size = derivativeUtils.calcSizeByPct({
                  pct: pctValue,
                  openVolume,
                  price,
                  ticket,
                  fields,
                  orders: orders || [],
                });
                const notional = utils.toNotional(size, price);
                form.setValue(sizeFieldName, size.toNumber());
                form.setValue(notionalFieldName, notional.toNumber());
                form.setValue(sizePctFieldName, pctValue);
              }
            }}
            placeholder={t('Select')}
            data-testid="size-override"
          >
            <MiniSelectOption
              value={StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE}
            >
              {t('Amount')}
            </MiniSelectOption>
            <MiniSelectOption
              value={
                StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
              }
            >
              {t('Percentage')}
            </MiniSelectOption>
          </MiniSelect>
        );
      }}
    />
  );
};
