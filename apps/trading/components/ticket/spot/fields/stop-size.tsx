import BigNumber from 'bignumber.js';

import { TicketInput, TradingInputError } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../../lib/use-t';
import { useTicketContext } from '../../ticket-context';
import { FormField } from '../../ticket-field';
import { InputLabel } from '../../elements/form';
import { useForm } from '../../use-form';

import { SizeModeButton } from '../../size-mode-button';

import * as spotUtils from '../utils';
import * as utils from '../../utils';

export const StopSize = ({
  name = 'size',
  price,
}: {
  name?: 'size' | 'ocoSize';
  price?: BigNumber;
}) => {
  const t = useT();
  const ticket = useTicketContext('spot');
  const form = useForm();

  const label = t('Size');
  const symbol = ticket.baseAsset.symbol;

  const isOco = name === 'ocoSize';
  const sizePctFieldName = isOco ? 'ocoSizePct' : 'sizePct';
  const notionalFieldName = isOco ? 'ocoNotional' : 'notional';
  const side = form.watch('side');

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <div className="w-full">
            <TicketInput
              {...field}
              label={<InputLabel label={label} symbol={symbol} />}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e);

                if (price) {
                  const notional = utils.toNotional(
                    BigNumber(e.target.value || 0),
                    price
                  );
                  form.setValue(notionalFieldName, notional.toNumber());
                }

                const pct = spotUtils.calcPctBySize({
                  size: BigNumber(e.target.value),
                  side,
                  price: price || BigNumber(0),
                  ticket,
                });

                form.setValue(sizePctFieldName, Number(pct));
              }}
              data-testid={`order-${name}`}
              appendElement={<SizeModeButton />}
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
