import * as RadioGroup from '@radix-ui/react-radio-group';
import { Side } from '@vegaprotocol/types';
import classNames from 'classnames';
import { useT } from '../../use-t';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

interface SideSelectorProps {
  value: Side;
  onValueChange: (side: Side) => void;
  isSpotMarket?: boolean;
}

export const SideSelector = ({
  isSpotMarket = false,
  ...props
}: SideSelectorProps) => {
  const t = useT();
  let toggles: Array<{
    label: string;
    value: Side;
    iconName?: VegaIconNames;
  }> = [
    {
      label: t('Long'),
      value: Side.SIDE_BUY,
      iconName: VegaIconNames.LONG,
    },
    {
      label: t('Short'),
      value: Side.SIDE_SELL,
      iconName: VegaIconNames.SHORT,
    },
  ];

  if (isSpotMarket) {
    toggles = [
      { label: t('Buy'), value: Side.SIDE_BUY },
      { label: t('Sell'), value: Side.SIDE_SELL },
    ];
  }

  return (
    <RadioGroup.Root
      name="order-side"
      className="relative mb-4 flex h-10 leading-10 bg-vega-clight-700 dark:bg-vega-cdark-700 rounded"
      {...props}
    >
      <span
        className={classNames(
          'absolute top-0 left-0 rounded w-1/2 h-full transition-transform',
          {
            'bg-vega-green-600 dark:bg-vega-green-650':
              props.value === Side.SIDE_BUY,
            'bg-vega-red-500 dark:bg-vega-red-600 translate-x-full':
              props.value === Side.SIDE_SELL,
          }
        )}
      />
      {toggles.map(({ label, value, iconName }) => (
        <RadioGroup.Item value={value} key={value} id={`side-${value}`} asChild>
          <button
            className={classNames(
              'flex gap-2 justify-center items-center flex-1 relative text-sm rounded transition-colors',
              'data-[state=unchecked]:hover:bg-vega-clight-500 dark:data-[state=unchecked]:hover:bg-vega-cdark-500',
              'data-[state=unchecked]:text-vega-clight-200 dark:data-[state=unchecked]:text-vega-cdark-200',
              'data-[state=checked]:text-vega-clight-800 dark:data-[state=checked]:text-vega-cdark-90'
            )}
            data-testid={`order-side-${value}`}
          >
            {label}
            {iconName && <VegaIcon name={iconName} size={18} />}
          </button>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
};
