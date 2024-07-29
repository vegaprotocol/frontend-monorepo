import BigNumber from 'bignumber.js';

import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useOpenVolume } from '@vegaprotocol/positions';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { StopOrderSizeOverrideSetting } from '@vegaprotocol/types';
import { useForm } from '../use-form';

import * as derivativeUtils from '../derivative/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const StopSize = ({
  name = 'size',
  price,
}: {
  name?: 'size' | 'ocoSize';
  price?: BigNumber;
}) => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('default');
  const form = useForm();

  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  const overrideFieldName =
    name === 'size' ? 'sizeOverride' : 'ocoSizeOverride';
  const sizeOverride = form.watch(overrideFieldName);
  const sizePctFieldName = name === 'size' ? 'sizePct' : 'ocoSizePct';

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={<SizeLabel name={name} />}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e);

                if (
                  sizeOverride ===
                  StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_NONE
                ) {
                  // calc max size
                  const pct = derivativeUtils.calcPctBySize({
                    size: BigNumber(e.target.value),
                    openVolume,
                    price: price || BigNumber(0),
                    ticket,
                    fields: form.getValues(),
                    orders: orders || [],
                  });

                  form.setValue(sizePctFieldName, Number(pct));
                }

                if (
                  sizeOverride ===
                  StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
                ) {
                  form.setValue(sizePctFieldName, Number(e.target.value), {
                    shouldValidate: true,
                  });
                }
              }}
              data-testid={`order-${name}`}
            />
            {fieldState.error && (
              <TradingInputError testId={`error-${name}`}>
                {fieldState.error.message}
              </TradingInputError>
            )}
          </div>
        );
      }}
    />
  );
};

const SizeLabel = (props: { name: 'size' | 'ocoSize' }) => {
  const t = useT();
  const form = useForm();
  const ticket = useTicketContext();

  const overrideFieldName =
    props.name === 'size' ? 'sizeOverride' : 'ocoSizeOverride';
  const sizeOverride = form.watch(overrideFieldName);

  let label = t('Size');

  // If we have a baseAsset object use that,
  // otherwise fall back to using the value specified
  // in metadata tags
  let symbol =
    ticket.type === 'spot' ? ticket.baseAsset.symbol : ticket.baseSymbol;

  if (
    sizeOverride === StopOrderSizeOverrideSetting.SIZE_OVERRIDE_SETTING_POSITION
  ) {
    label = t('Quantity');
    symbol = '%';
  }

  return <InputLabel label={label} symbol={symbol} />;
};
