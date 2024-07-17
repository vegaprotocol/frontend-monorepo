import BigNumber from 'bignumber.js';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

import * as utils from '../utils';

export const Price = ({ name = 'price' }: { name?: 'price' | 'ocoPrice' }) => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  const sizeMode = form.watch('sizeMode');
  const size = form.watch('size');
  const notional = form.watch('notional');

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            value={field.value || ''}
            onChange={(e) => {
              field.onChange(e);

              if (sizeMode === 'contracts' && size) {
                const notional = utils.toNotional(
                  BigNumber(size),
                  BigNumber(e.target.value || 0)
                );
                form.setValue('notional', notional.toNumber());
                return;
              }

              if (sizeMode === 'notional' && notional) {
                const size = utils.toSize(
                  BigNumber(notional),
                  BigNumber(e.target.value || 0),
                  ticket.market.positionDecimalPlaces
                );
                form.setValue('size', size.toNumber());
              }
            }}
            data-testid="order-price"
            label={
              <InputLabel
                label={t('Price')}
                symbol={ticket.quoteAsset.symbol}
              />
            }
          />
        );
      }}
    />
  );
};
