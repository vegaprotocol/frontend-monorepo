import BigNumber from 'bignumber.js';

import { TicketInput } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

import * as utils from '../utils';
import { SizeModeButton } from '../size-mode-button';

export const Notional = (props: { price?: BigNumber }) => {
  const ticket = useTicketContext();
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name="notional"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={<NotionalLabel />}
            value={field.value || ''}
            onChange={(e) => {
              field.onChange(e);

              if (props.price) {
                const size = utils.toSize(
                  BigNumber(e.target.value),
                  props.price,
                  ticket.market.positionDecimalPlaces
                );
                form.setValue('size', size.toNumber());
              }
            }}
            appendElement={<SizeModeButton />}
          />
        );
      }}
    />
  );
};

const NotionalLabel = () => {
  const t = useT();
  const ticket = useTicketContext();
  const label = t('Notional');
  const symbol = ticket.quoteAsset.symbol;

  return <InputLabel label={label} symbol={symbol} />;
};
