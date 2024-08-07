import BigNumber from 'bignumber.js';

import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

import * as utils from '../utils';
import * as derivativeUtils from '../derivative/utils';

import { SizeModeButton } from '../size-mode-button';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useOpenVolume } from '@vegaprotocol/positions';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const Size = (props: { price?: BigNumber }) => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('default');
  const form = useForm('limit' as 'limit' | 'market');

  const { data: orders } = useActiveOrders(pubKey, ticket.market.id);
  const { openVolume } = useOpenVolume(pubKey, ticket.market.id) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };

  return (
    <FormField
      control={form.control}
      name="size"
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={<SizeLabel />}
              value={field.value || ''}
              data-testid="order-size"
              onChange={(e) => {
                field.onChange(e);

                // if we have a price, we can calc and set notional and size pct
                if (props.price) {
                  const size = BigNumber(e.target.value || 0);
                  const notional = utils.toNotional(size, props.price);
                  const fields = form.getValues();
                  const pct = derivativeUtils.calcPctBySize({
                    size,
                    openVolume,
                    price: props.price || BigNumber(0),
                    ticket,
                    fields,
                    orders: orders || [],
                  });

                  form.setValue('notional', notional.toNumber(), {
                    shouldValidate: true,
                  });
                  form.setValue('sizePct', pct.toNumber(), {
                    shouldValidate: true,
                  });
                }
              }}
              appendElement={<SizeModeButton />}
            />
            {fieldState.error && (
              <TradingInputError testId="error-size">
                {fieldState.error.message}
              </TradingInputError>
            )}
          </div>
        );
      }}
    />
  );
};

const SizeLabel = () => {
  const t = useT();
  const ticket = useTicketContext();
  const label = t('Size');
  const symbol =
    ticket.type === 'spot' ? ticket.baseAsset.symbol : ticket.baseSymbol;

  return <InputLabel label={label} symbol={symbol} />;
};
