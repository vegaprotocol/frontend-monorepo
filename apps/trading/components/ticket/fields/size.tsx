import BigNumber from 'bignumber.js';

import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

import * as utils from '../utils';
import * as defaultUtils from '../ticket-default/utils';

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

                if (props.price) {
                  const notional = utils.toNotional(
                    BigNumber(e.target.value || 0),
                    props.price
                  );
                  form.setValue('notional', notional.toNumber());
                }

                const fields = form.getValues();

                const pct = defaultUtils.calcPctBySize({
                  size: BigNumber(e.target.value),
                  openVolume,
                  price: props.price || BigNumber(0),
                  ticket,
                  fields,
                  orders: orders || [],
                });

                form.setValue('sizePct', Number(pct));
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
