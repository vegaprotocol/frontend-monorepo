import { useFormContext, type Control } from 'react-hook-form';
import { FormField } from '../ticket-field';
import { useT } from '../../../lib/use-t';
import { TicketInput, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useNotionalSizeFlip } from '../use-notional-size-flip';

export const Size = (props: { control: Control<any>; price?: BigNumber }) => {
  const t = useT();
  const form = useFormContext();
  const mode = form.watch('mode');
  const flip = useNotionalSizeFlip();
  return (
    <FormField
      {...props}
      name="size"
      render={({ field }) => {
        return (
          <TicketInput
            {...field}
            label={mode === 'size' ? t('Size') : t('Notional')}
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
