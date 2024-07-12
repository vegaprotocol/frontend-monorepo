import classNames from 'classnames';
import * as RadioGroup from '@radix-ui/react-toggle-group';

import { Side as ESide } from '@vegaprotocol/types';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';

export const Side = () => {
  const toggles = useToggles();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="side"
      render={({ field }) => {
        return (
          <RadioGroup.Root
            className="relative flex h-10 leading-10 bg-vega-clight-700 dark:bg-vega-cdark-700 rounded"
            type="single"
            {...field}
            onValueChange={field.onChange}
          >
            <span
              className={classNames(
                'absolute top-0 left-0 rounded w-1/2 h-full transition-transform',
                {
                  'bg-vega-green-600 dark:bg-vega-green-650':
                    field.value === ESide.SIDE_BUY,
                  'bg-vega-red-500 dark:bg-vega-red-600 translate-x-full':
                    field.value === ESide.SIDE_SELL,
                }
              )}
            />
            {toggles.map(({ label, value, iconName }) => (
              <RadioGroup.Item
                value={value}
                key={value}
                className={classNames(
                  'flex gap-2 justify-center items-center flex-1 relative text-sm rounded transition-colors',
                  'data-[state=off]:hover:bg-vega-clight-500 dark:data-[state=off]:hover:bg-vega-cdark-500',
                  'data-[state=off]:text-vega-clight-200 dark:data-[state=off]:text-vega-cdark-200',
                  'data-[state=on]:text-vega-clight-800 dark:data-[state=on]:text-vega-cdark-90'
                )}
              >
                {label}
                {iconName && <VegaIcon name={iconName} size={18} />}
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
        );
      }}
    />
  );
};

const useToggles = () => {
  const t = useT();
  const ticket = useTicketContext();

  if (ticket.type === 'spot') {
    return [
      {
        label: t('Buy'),
        value: ESide.SIDE_BUY,
        iconName: undefined,
      },
      {
        label: t('Sell'),
        value: ESide.SIDE_SELL,
        iconName: undefined,
      },
    ];
  }

  return [
    {
      label: t('Long'),
      value: ESide.SIDE_BUY,
      iconName: VegaIconNames.LONG,
    },
    {
      label: t('Short'),
      value: ESide.SIDE_SELL,
      iconName: VegaIconNames.SHORT,
    },
  ];
};
