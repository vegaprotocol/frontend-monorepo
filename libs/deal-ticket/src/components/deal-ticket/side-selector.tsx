import * as RadioGroup from '@radix-ui/react-radio-group';
import { Side } from '@vegaprotocol/types';
import classNames from 'classnames';
import { useT } from '../../use-t';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

interface SideSelectorProps {
  value: Schema.Side;
  onValueChange: (side: Schema.Side) => void;
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
      className="mb-4 flex h-10 leading-10 bg-vega-clight-700 dark:bg-vega-cdark-700 rounded"
      {...props}
    >
      {toggles.map(({ label, value, iconName }) => (
        <RadioGroup.Item value={value} key={value} id={`side-${value}`} asChild>
          <button
            className={classNames(
              'flex gap-2 justify-center items-center flex-1 relative text-sm rounded',
              'data-[state=unchecked]:text-vega-clight-200 dark:data-[state=unchecked]:text-vega-cdark-200',
              'data-[state=checked]:text-vega-clight-90 dark:data-[state=checked]:text-vega-cdark-90',
              {
                'data-[state=checked]:bg-vega-green-650':
                  value === Side.SIDE_BUY,
                'data-[state=checked]:bg-vega-red-600':
                  value === Side.SIDE_SELL,
              }
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
