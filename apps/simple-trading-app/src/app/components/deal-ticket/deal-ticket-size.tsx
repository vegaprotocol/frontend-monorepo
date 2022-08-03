import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderRange,
} from '@vegaprotocol/ui-toolkit';

import { t } from '@vegaprotocol/react-helpers';

interface DealTicketSizeProps {
  step: number;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number[]) => void;
  name: string;
  quoteName: string;
  price: string;
  estCloseOut: string;
  estMargin: string;
}

export const DealTicketSize = ({
  value,
  step,
  min,
  max,
  price,
  quoteName,
  onValueChange,
  estCloseOut,
}: DealTicketSizeProps) => {
  return max === 0 ? (
    <p>Not enough balance to trade</p>
  ) : (
    <div>
      <div className="flex justify-between text-black dark:text-white mb-8">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <SliderRoot
        className="mb-16"
        value={[value]}
        onValueChange={onValueChange}
        step={step}
        min={min}
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
            <span>{t('Size')}</span>
            &nbsp;
            <small>({quoteName})</small>
          </dt>
          <dd>{value}</dd>
        </div>
        <div className="flex justify-between mb-8">
          <dt>{t('Est. price')}</dt>
          <dd>{price}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t('Est. close out')}</dt>
          <dd>{estCloseOut}</dd>
        </div>
      </dl>
    </div>
  );
};
