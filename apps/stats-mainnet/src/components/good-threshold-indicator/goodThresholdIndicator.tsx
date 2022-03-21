import { value, goodThreshold } from '../../config/types';

interface GoodThresholdIndicatorProps {
  goodThreshold: goodThreshold | undefined;
  value: value;
}

export const GoodThresholdIndicator = ({
  goodThreshold,
  value,
}: GoodThresholdIndicatorProps) => {
  return (
    <div
      className={`inline-block w-2 h-2 mb-[0.15rem] mr-2 rounded-xl ${
        (goodThreshold &&
          (goodThreshold(value) ? 'bg-vega-green' : 'bg-vega-red')) ||
        'bg-current'
      }`}
    />
  );
};
