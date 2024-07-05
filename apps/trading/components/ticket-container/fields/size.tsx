import { useFormContext, type Control } from 'react-hook-form';
import type BigNumber from 'bignumber.js';

import { TicketInput, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useNotionalSizeFlip } from '../use-notional-size-flip';
import { useTicketContext } from '../ticket-context';
import { FormField } from '../ticket-field';

export const Size = (props: { control: Control<any>; price?: BigNumber }) => {
  const flip = useNotionalSizeFlip();

  return (
    <FormField
      {...props}
      name="size"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={<SizeLabel />}
            value={field.value}
            onChange={field.onChange}
            appendElement={
              <button
                className="flex justify-center items-center bg-vega-clight-500 dark:bg-vega-cdark-500 p-2 rounded"
                type="button"
                onClick={() => flip(props.price)}
              >
                <VegaIcon name={VegaIconNames.TRANSFER} size={14} />
              </button>
            }
          />
        );
      }}
    />
  );
};

const SizeLabel = () => {
  const t = useT();
  const form = useFormContext();
  const ticket = useTicketContext();
  const sizeMode = form.watch('sizeMode');

  // If we have a baseAsset object use that,
  // otherwise fall back to using the value specified
  // in metadata tags
  const baseSymbol = ticket.baseAsset
    ? ticket.baseAsset.symbol
    : ticket.baseSymbol;

  const symbol =
    sizeMode === 'contracts' ? baseSymbol : ticket.quoteAsset.symbol;

  return (
    <>
      <span className="text-default">{t('Size')}</span> {symbol}
    </>
  );
};
