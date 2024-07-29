import BigNumber from 'bignumber.js';

import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../../lib/use-t';
import { useTicketContext } from '../../ticket-context';
import { FormField } from '../../ticket-field';
import { InputLabel } from '../../elements/form';
import { useForm } from '../../use-form';

import * as utils from '../../utils';
import * as spotUtils from '../utils';

import { SizeModeButton } from '../../size-mode-button';

export const Size = (props: { price?: BigNumber }) => {
  const ticket = useTicketContext('spot');
  const form = useForm('limit' as 'limit' | 'market');

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

                const pct = spotUtils.calcPctBySize({
                  size: BigNumber(e.target.value),
                  side: fields.side,
                  price: props.price || BigNumber(0),
                  ticket,
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
  const ticket = useTicketContext('spot');
  const label = t('Size');

  return <InputLabel label={label} symbol={ticket.baseAsset.symbol} />;
};
