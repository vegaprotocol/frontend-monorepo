import {
  type OrderTimeInForce,
  OrderTimeInForceCode,
} from '@vegaprotocol/types';
import {
  MiniSelect,
  MiniSelectOption,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';

import { FormField } from '../ticket-field';
import {
  TIF_OPTIONS,
  NON_PERSISTENT_TIF_OPTIONS,
  tooltipProps,
} from '../constants';
import { useForm } from '../use-form';

export const TimeInForce = ({
  name = 'timeInForce',
}: {
  name?: 'timeInForce' | 'ocoTimeInForce';
}) => {
  const t = useT();
  const form = useForm();
  const options = useOptions();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <div className="flex items-center gap-2 text-xs">
            <Tooltip
              {...tooltipProps}
              description={<TooltipContent options={options} />}
            >
              <label className="text-surface-1-fg-muted" htmlFor={field.name}>
                {t('TIF')}
              </label>
            </Tooltip>
            <MiniSelect
              id={field.name}
              name={field.name}
              placeholder="Select"
              value={field.value}
              onValueChange={(value) => {
                if (!value) return;
                field.onChange(value);
              }}
              trigger={OrderTimeInForceCode[field.value as OrderTimeInForce]}
              data-testid="order-tif"
            >
              {options.map((tif) => (
                <MiniSelectOption key={tif} value={tif}>
                  {t(tif)}
                </MiniSelectOption>
              ))}
            </MiniSelect>
          </div>
        );
      }}
    />
  );
};

const useOptions = () => {
  const form = useForm();
  const ticketType = form.watch('ticketType');

  if (ticketType === 'market') {
    return NON_PERSISTENT_TIF_OPTIONS;
  }

  if (ticketType === 'stopMarket') {
    return NON_PERSISTENT_TIF_OPTIONS;
  }

  if (ticketType === 'stopLimit') {
    return NON_PERSISTENT_TIF_OPTIONS;
  }

  return TIF_OPTIONS;
};

const TooltipContent = (props: { options: OrderTimeInForce[] }) => {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      <p>{t('Set the time in force (TIF) of the order')}</p>
      <dl className="grid grid-cols-2 gap-1.5">
        {props.options.map((o) => (
          <>
            <dt>{t(o)}</dt>
            <dd>{t(`${o}_tooltip`)}</dd>
          </>
        ))}
      </dl>
    </div>
  );
};
