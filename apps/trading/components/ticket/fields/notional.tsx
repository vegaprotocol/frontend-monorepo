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

export const Notional = ({
  name = 'notional',
  price,
}: {
  name?: 'notional' | 'ocoNotional';
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

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={<NotionalLabel />}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e);

                const fields = form.getValues();
                const isOco = name === 'ocoNotional';

                if (price) {
                  const size = utils.toSize(
                    BigNumber(e.target.value || 0),
                    price,
                    ticket.market.positionDecimalPlaces
                  );

                  const pct = derivativeUtils.calcPctBySize({
                    size,
                    openVolume,
                    price: price || BigNumber(0),
                    ticket,
                    fields,
                    orders: orders || [],
                  });

                  if (isOco) {
                    form.setValue('ocoSize', size.toNumber());
                    form.setValue('ocoSizePct', pct.toNumber());
                  } else {
                    form.setValue('size', size.toNumber());
                    form.setValue('sizePct', pct.toNumber());
                  }
                }
              }}
              appendElement={<SizeModeButton />}
            />
            {fieldState.error && (
              <TradingInputError>{fieldState.error.message}</TradingInputError>
            )}
          </div>
        );
      }}
    />
  );
};

const NotionalLabel = () => {
  const t = useT();
  const ticket = useTicketContext();
  const label = t('Notional');
  const symbol =
    ticket.type === 'default' && ticket.quoteName.length > 0
      ? ticket.quoteName
      : ticket.quoteAsset.symbol;

  return <InputLabel label={label} symbol={symbol} />;
};
