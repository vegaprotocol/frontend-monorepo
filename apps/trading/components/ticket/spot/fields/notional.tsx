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

export const Notional = ({
  name = 'notional',
  price,
}: {
  name?: 'notional' | 'ocoNotional';
  price?: BigNumber;
}) => {
  const ticket = useTicketContext('spot');
  const form = useForm();

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

                  const pct = spotUtils.calcPctBySize({
                    size,
                    side: fields.side,
                    price,
                    ticket,
                  });

                  if (isOco) {
                    form.setValue('ocoSize', size.toNumber());
                    form.setValue('ocoSizePct', Number(pct));
                  } else {
                    form.setValue('size', size.toNumber());
                    form.setValue('sizePct', Number(pct));
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
  const ticket = useTicketContext('spot');
  const label = t('Notional');
  const symbol = ticket.quoteAsset.symbol;

  return <InputLabel label={label} symbol={symbol} />;
};
