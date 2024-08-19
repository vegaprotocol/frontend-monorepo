import { cn } from '@vegaprotocol/ui-toolkit';
import * as RadioGroup from '@radix-ui/react-toggle-group';

import { Side as ESide } from '@vegaprotocol/types';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { FormField } from '../ticket-field';
import { useTicketContext } from '../ticket-context';
import { useForm } from '../use-form';

export const Side = (props: {
  side: ESide;
  onSideChange: (side: ESide) => void;
}) => {
  const toggles = useToggles();
  const form = useForm();
  return (
    <FormField
      control={form.control}
      name="side"
      render={({ field }) => {
        return (
          <RadioGroup.Root
            className="relative flex h-10 leading-10 bg-surface-2 rounded"
            type="single"
            {...field}
            onValueChange={(value) => {
              if (!value) return;
              field.onChange(value);
              props.onSideChange(value as ESide);
            }}
          >
            <span
              className={cn(
                'absolute top-0 left-0 rounded w-1/2 h-full transition-transform',
                {
                  'bg-green-600 dark:bg-green-650':
                    field.value === ESide.SIDE_BUY,
                  'bg-red-500 dark:bg-red-600 translate-x-full':
                    field.value === ESide.SIDE_SELL,
                }
              )}
            />
            {toggles.map(({ label, value, iconName }) => (
              <RadioGroup.Item
                value={value}
                key={value}
                data-testid={`order-side-${value}`}
                className={cn(
                  'flex gap-2 justify-center items-center flex-1 relative text-sm rounded transition-colors',
                  'data-[state=off]:hover:bg-surface-3',
                  'data-[state=on]:text-white'
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
