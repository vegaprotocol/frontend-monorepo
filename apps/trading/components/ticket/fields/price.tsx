import BigNumber from 'bignumber.js';

import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';
import { useTicketContext } from '../ticket-context';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

import * as utils from '../utils';

export const Price = ({ name = 'price' }: { name?: 'price' | 'ocoPrice' }) => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  const isOco = name === 'ocoPrice';
  const sizeFieldName = isOco ? 'ocoSize' : 'size';
  const notionalFieldName = isOco ? 'ocoNotional' : 'notional';

  const sizeMode = form.watch('sizeMode');
  const size = form.watch(sizeFieldName);
  const notional = form.watch(notionalFieldName);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
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
                  form.setValue(notionalFieldName, notional.toNumber());
                  return;
                }

                if (sizeMode === 'notional' && notional) {
                  const size = utils.toSize(
                    BigNumber(notional),
                    BigNumber(e.target.value || 0),
                    ticket.market.positionDecimalPlaces
                  );
                  form.setValue(sizeFieldName, size.toNumber());
                }
              }}
              data-testid={`order-${name}`}
              label={
                <InputLabel
                  label={t('Price')}
                  symbol={
                    ticket.type === 'default' && ticket.quoteName.length > 0
                      ? ticket.quoteName
                      : ticket.quoteAsset.symbol
                  }
                />
              }
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
