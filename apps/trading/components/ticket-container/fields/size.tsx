import BigNumber from 'bignumber.js';

import { TicketInput } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';
import { InputLabel } from '../elements/form';
import { useForm } from '../use-form';

import * as utils from '../utils';
import { SizeModeButton } from '../size-mode-button';

export const Size = (props: { price?: BigNumber }) => {
  const form = useForm();

  return (
    <FormField
      control={form.control}
      name="size"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={<SizeLabel />}
            value={field.value || ''}
            onChange={(e) => {
              field.onChange(e);

              if (props.price) {
                const notional = utils.toNotional(
                  BigNumber(e.target.value),
                  props.price
                );
                form.setValue('notional', notional.toNumber());
              }
            }}
            appendElement={<SizeModeButton />}
          />
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
