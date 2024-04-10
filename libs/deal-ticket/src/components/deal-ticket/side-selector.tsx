import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Schema from '@vegaprotocol/types';
import classNames from 'classnames';
import { useT } from '../../use-t';

interface SideSelectorProps {
  value: Schema.Side;
  onValueChange: (side: Schema.Side) => void;
  productType: Schema.ProductType;
}

export const SideSelector = ({ productType, ...props }: SideSelectorProps) => {
  const t = useT();
  let toggles = [
    { label: t('Long'), value: Schema.Side.SIDE_BUY },
    { label: t('Short'), value: Schema.Side.SIDE_SELL },
  ];

  if (productType === 'Spot') {
    toggles = [
      { label: t('Buy'), value: Schema.Side.SIDE_BUY },
      { label: t('Sell'), value: Schema.Side.SIDE_SELL },
    ];
  }

  return (
    <RadioGroup.Root
      name="order-side"
      className="mb-4 flex h-10 leading-10"
      {...props}
    >
      {toggles.map(({ label, value }) => (
        <RadioGroup.Item value={value} key={value} id={`side-${value}`} asChild>
          <button
            className="flex-1 relative font-alpha text-sm"
            data-testid={`order-side-${value}`}
          >
            {label}
            <RadioGroup.Indicator
              className={classNames('absolute bottom-0 left-0 right-0 h-0.5', {
                'bg-market-red': props.value === Schema.Side.SIDE_SELL,
                'bg-market-green-550': props.value === Schema.Side.SIDE_BUY,
              })}
            />
          </button>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
};
