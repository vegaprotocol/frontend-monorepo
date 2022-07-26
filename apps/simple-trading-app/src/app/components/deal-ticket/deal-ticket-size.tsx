import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderRange,
} from '@vegaprotocol/ui-toolkit';

interface DealTicketSizeProps {
  step: number;
  value: number;
  onValueChange: (value: number[]) => void;
  name: string;
  quoteName: string;
  price: string;
}

export const DealTicketSize = ({
  value,
  step,
  price,
  quoteName,
  onValueChange,
}: DealTicketSizeProps) => {
  const max = 200000;

  return (
    <div>
      <div className="flex justify-between text-black dark:text-white mb-8">
        <span>{step}</span>
        <span>{max}</span>
      </div>
      <SliderRoot
        className="mb-16"
        value={[value]}
        onValueChange={onValueChange}
        step={step}
        min={step}
        max={max}
      >
        <SliderTrack className="bg-lightGrey dark:bg-offBlack">
          <SliderRange className="!bg-black dark:!bg-white" />
        </SliderTrack>
        <SliderThumb />
      </SliderRoot>
      <dl className="text-black dark:text-white">
        <div className="flex justify-between mb-8">
          <dt>
            <span>Size</span>
            &nbsp;
            <small>({quoteName})</small>
          </dt>
          <dd>{value}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Est. Price</dt>
          <dd>{price}</dd>
        </div>
      </dl>
    </div>
  );
};
